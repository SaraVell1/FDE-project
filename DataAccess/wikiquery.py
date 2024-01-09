from datetime import datetime, timezone, timedelta
from dateutil import parser
import re
import sys
from rdflib import Graph, Literal, RDF, URIRef
import requests
import urllib
import Utils.queries as queries
from flask import Flask, jsonify, request
from SPARQLWrapper import SPARQLWrapper, JSON, TURTLE

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
    
    def get_turtle_results(self, endpoint_url, query):
        user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
        sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
        sparql.setQuery(query)
        sparql.setReturnFormat(TURTLE)
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
                case "Other":
                    return self.defaultEntityQuery(id)
        except Exception as e:
            return f"An error occurred: {str(e)}"

    def getHumanInfo(self, id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = queries.personQuery(id)
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)
            my_turtle_result = result.get_turtle_results(endpoint_url, query)

            turtle_graph = Graph()
           

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

                subject = URIRef("http://example.org/person/" + id)
                turtle_graph.add((subject, RDF.type, URIRef("http://example.org/ontology/Human")))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/name"), Literal(person_label)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/description"), Literal(description)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/gender"), Literal(gender)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/birthDate"), Literal(birth_date)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/deathDate"), Literal(death_date)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/occupation"), Literal(occupation_label)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/image"), URIRef(image_url)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/placeOfBirth"), Literal(place_of_birth)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/placeOfDeath"), Literal(place_of_death)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/viafID"), Literal(viafID)))
                turtle_graph.add((subject, URIRef("http://example.org/ontology/wikipedia"), URIRef(wikipedia_url)))

                turtle_data = turtle_graph.serialize(format='turtle')

            return { "type": "Human", "data": {"Name": person_label, "Description": description, "Gender":gender, "Birth Date": birth_date, "Death Date": death_date, "Occupation": occupation_label, "Image": image_url, "Birth Place": place_of_birth,
                    "Death Place":place_of_death, "viafID":viafID, "Wikipedia":wikipedia_url, "Turtle": turtle_data}}
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
            return { "type": "Other", "data": {"Name": official_name, "Description": description, "Image": image_url,
                    "viafID":viafID, "Wikipedia": wikipedia_url }}
        except Exception as e:
            return f"An error occurred: {str(e)}"
             
    def formatDate(self, date):
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
            return result
        else:
            return ""

    def checkIfEmpty(self, info):
        if info == "":
            return "-"
        else:
            return info