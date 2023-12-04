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
                birth_date = self.formatDate(res.get("dateOfBirth", {}).get("value", ""))
                death_date = self.formatDate(res.get("dateOfDeath", {}).get("value", ""))
                occupation_label = res.get("occupationLabel", {}).get("value", "")
                image_url = res.get("image", {}).get("value", "")
                place_of_birth = res.get("placeBLabel", {}).get("value", "")
                place_of_death = res.get("placeDLabel", {}).get("value", "")
            return { "type": "human", "data": {"Name": person_label, "BirthDate": birth_date, "DeathDate": death_date, "Occupation": occupation_label, "Image": image_url, "BirthPlace": place_of_birth,
                    "DeathPlace":place_of_death}}
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
                country = res.get("countryLabel", {}).get("value", "")
                image_url = res.get("flag", {}).get("value", "")
                population = res.get("population", {}).get("value", "")
                region = res.get("regionLabel", {}).get("value", "")
            return { "type": "city", "data": {"Name": official_name, "Country": country, "Population": population, "Image": image_url,
                    "Region": region }}
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