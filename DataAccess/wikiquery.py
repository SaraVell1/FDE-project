from datetime import datetime, timezone, timedelta
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
                person_label =  self.checkIfEmpty(res.get("personLabel", {}).get("value", ""))
                description =  self.checkIfEmpty(res.get("personDesc", {}).get("value", "").capitalize())
                gender =  self.checkIfEmpty(res.get("genderLabel", {}).get("value", "").capitalize())
                birth_date =  self.checkIfEmpty(self.formatDate(res.get("dateOfBirth", {}).get("value", "")))
                death_date = self.checkIfEmpty(self.formatDate(res.get("dateOfDeath", {}).get("value", "")))
                occupation_label =  self.checkIfEmpty(res.get("occupationsLabels", {}).get("value", "").capitalize())
                image_url =  self.checkIfEmpty(res.get("image", {}).get("value", ""))
                place_of_birth =  self.checkIfEmpty(res.get("placeBLabel", {}).get("value", "").capitalize())
                place_of_death =  self.checkIfEmpty(res.get("placeDLabel", {}).get("value", "").capitalize())
                viafID =  self.checkIfEmpty(res.get("viafID", {}).get("value", ""))
                wikipedia_url =  self.checkIfEmpty(res.get("wiki_page", {}).get("value", ""))
            return { "type": "Human", "data": {"Name": person_label, "Description": description, "Gender":gender, "Birth Date": birth_date, "Death Date": death_date, "Occupation": occupation_label, "Image": image_url, "Birth Place": place_of_birth,
                    "Death Place":place_of_death, "viafID":viafID, "Wikipedia":wikipedia_url}}
        except Exception as e:
            return f"An error occurred: {str(e)}"
    
    def getLocationInfo(self, id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = queries.locationQuery(id)
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)

            for res in my_res["results"]["bindings"]:
                official_name =  self.checkIfEmpty(res.get("officialName", {}).get("value", ""))
                description =  self.checkIfEmpty(res.get("locationDesc", {}).get("value", "").capitalize())
                language =  self.checkIfEmpty(res.get("officialLanguageLabel", {}).get("value", "").capitalize())
                currency =  self.checkIfEmpty(res.get("currencyLabel", {}).get("value", ""))
                population =  self.checkIfEmpty(res.get("population", {}).get("value", ""))
                image_url =  self.checkIfEmpty(res.get("flag", {}).get("value", ""))
                viafID =  self.checkIfEmpty(res.get("viafID", {}).get("value", ""))
                wikipedia_url =  self.checkIfEmpty(res.get("wiki_page", {}).get("value", ""))
            return { "type": "Location", "data": {"Name": official_name, "Description": description, "Language": language, "Currency":currency,"Population": population, "Flag": image_url,
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
                official_name =  self.checkIfEmpty(res.get("spaceObjLabel", {}).get("value", ""))
                description =  self.checkIfEmpty(res.get("spaceObjDesc", {}).get("value", "").capitalize())
                partOf =  self.checkIfEmpty(res.get("partOfLabel", {}).get("value", "").capitalize())
                mass =  self.checkIfEmpty(res.get("mass", {}).get("value", ""))
                image_url =  self.checkIfEmpty(res.get("image", {}).get("value", ""))
                viafID =  self.checkIfEmpty(res.get("viafID", {}).get("value", ""))
                wikipedia_url =  self.checkIfEmpty(res.get("wiki_page", {}).get("value", ""))
            return { "type": "Space", "data": {"Name": official_name, "Description": description, "Part Of": partOf, "Mass":mass, "Image": image_url,
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
                official_name = self.checkIfEmpty(res.get("entityLabel", {}).get("value", ""))
                description = self.checkIfEmpty(res.get("entityDesc", {}).get("value", "").capitalize())
                image_url = self.checkIfEmpty(res.get("image", {}).get("value", ""))
                viafID = self.checkIfEmpty(res.get("viafID", {}).get("value", ""))
                wikipedia_url = self.checkIfEmpty(res.get("wiki_page", {}).get("value", ""))
            return { "type": "Default", "data": {"Name": official_name, "Description": description, "Image": image_url,
                    "viafID":viafID, "Wikipedia": wikipedia_url }}
        except Exception as e:
            return f"An error occurred: {str(e)}"
             
    def formatDate(self, date):
        print("my date is", date)
        if(date != ""):
            date_object = parser.parse(date)
            date_object = date_object.replace(tzinfo=timezone.utc)
            formatted_date = date_object.strftime('%d %B %Y')

            formatted_date = formatted_date.replace(" 0", "")
            day = date_object.day
            month = date_object.strftime('%B')
            year = date_object.year
            era = 'BCE' if date_object.year < 1 else 'CE'
            result = f"{day} {month[:3]} {year} {era}"
            print(result)
            return result
        else:
            return ""

    def checkIfEmpty(self, info):
        if info == "":
            return "-"
        else:
            return info