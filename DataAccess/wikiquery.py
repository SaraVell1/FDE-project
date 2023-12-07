from dateutil import parser
import re
import sys
import requests
import urllib
import Utils.queries as queries
from flask import Flask, jsonify, request
from SPARQLWrapper import SPARQLWrapper, JSON

class Result():
    def _init_(self, endpoint_url, query):
        self.endpoint_url = endpoint_url
        self.query = query
        
    def get_results(self, endpoint_url, query):
        user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
        sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        return sparql.query().convert()

    def findEntityInfo(self, type, id):
        try:
            match type:
                case "Human":
                    return self.getHumanInfo(id)
                case "Location":
                    return self.getLocationInfo(id)
                case "Space":
                    return self.getSpaceObjectQuery(id)
                case "Default":
                    return self.defaultEntityQuery(id)
        except Exception as e:
            return f"An error occurred: {str(e)}"

    def getHumanInfo(self, id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = queries.personQuery(id)
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)

            for res in my_res["results"]["bindings"]:
                person_label = res.get("personLabel", {}).get("value", "")
                description = res.get("personDesc", {}).get("value", "")
                gender = res.get("genderLabel", {}).get("value", "")
                birth_date = self.formatDate(res.get("dateOfBirth", {}).get("value", ""))
                death_date = self.formatDate(res.get("dateOfDeath", {}).get("value", ""))
                occupation_label = res.get("occupationsLabels", {}).get("value", "")
                image_url = res.get("image", {}).get("value", "")
                place_of_birth = res.get("placeBLabel", {}).get("value", "")
                place_of_death = res.get("placeDLabel", {}).get("value", "")
                viafID = res.get("viafID", {}).get("value", "")
                wikipedia_url = res.get("wiki_page", {}).get("value", "")
            return { "type": "Human", "data": {"Name": person_label, "Description": description, "Gender":gender, "Birth_Date": birth_date, "Death_Date": death_date, "Occupation": occupation_label, "Image": image_url, "Birth_Place": place_of_birth,
                    "Death_Place":place_of_death, "viafID":viafID, "Wikipedia":wikipedia_url}}
        except Exception as e:
            return f"An error occurred: {str(e)}"
    
    def getLocationInfo(self, id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = queries.locationQuery(id)
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)

            for res in my_res["results"]["bindings"]:
                official_name = res.get("officialName", {}).get("value", "")
                description = res.get("locationDesc", {}).get("value", "")
                language = res.get("officialLanguageLabel", {}).get("value", "")
                currency = res.get("currencyLabel", {}).get("value", "")
                population = res.get("population", {}).get("value", "")
                image_url = res.get("flag", {}).get("value", "")
                viafID = res.get("viafID", {}).get("value", "")
                wikipedia_url = res.get("wiki_page", {}).get("value", "")
            return { "type": "Location", "data": {"Name": official_name, "Description": description, "Language": language, "Currency":currency,"Population": population, "Image": image_url,
                    "viafID":viafID, "Wikipedia": wikipedia_url }}
        except Exception as e:
            return f"An error occurred: {str(e)}"

    def getSpaceObjectQuery(self, id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = queries.spaceObjQuery(id)
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)

            for res in my_res["results"]["bindings"]:
                official_name = res.get("spaceObjLabel", {}).get("value", "")
                description = res.get("spaceObjDesc", {}).get("value", "")
                partOf = res.get("partOfLabel", {}).get("value", "")
                mass = res.get("mass", {}).get("value", "")
                image_url = res.get("image", {}).get("value", "")
                viafID = res.get("viafID", {}).get("value", "")
                wikipedia_url = res.get("wiki_page", {}).get("value", "")
            return { "type": "Space", "data": {"Name": official_name, "Description": description, "Part_Of": partOf, "Mass":mass, "Image": image_url,
                    "viafID":viafID, "Wikipedia": wikipedia_url }}
        except Exception as e:
            return f"An error occurred: {str(e)}"

    def defaultEntityQuery(self, id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = queries.defaultEntity(id)
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)

            for res in my_res["results"]["bindings"]:
                official_name = res.get("entityLabel", {}).get("value", "")
                description = res.get("entityDesc", {}).get("value", "")
                image_url = res.get("image", {}).get("value", "")
                viafID = res.get("viafID", {}).get("value", "")
                wikipedia_url = res.get("wiki_page", {}).get("value", "")
            return { "type": "Default", "data": {"Name": official_name, "Description": description, "Image": image_url,
                    "viafID":viafID, "Wikipedia": wikipedia_url }}
        except Exception as e:
            return f"An error occurred: {str(e)}"
             
    def formatDate(self, date):
        print("my date is", date)
        parsed_date = parser.parse(date)
        result = self.isBCE(parsed_date)
        if(result is None):
            end_date = parsed_date.strftime("%d/%m/%Y")
            print(end_date)
            return end_date
        else:
            return result

    def isBCE(self, date):
        try:
            year_without_zero = str(date.year).lstrip('0')
            year = int(year_without_zero)
            return year
        except:
            return None