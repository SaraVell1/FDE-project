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

    def removearticles(self, text):
        return re.sub(r'\b(?:a|an|the)\b', '', text, flags=re.IGNORECASE)
        
    def get_results(self, endpoint_url, query):
        user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
        # TODO adjust user agent; see https://w.wiki/CX6
        sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        return sparql.query().convert()


    def getResWiki(self, id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = queries.personQuery(id)
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)

            for res in my_res["results"]["bindings"]:
                person_label = res.get("personLabel", {}).get("value", "")
                life_span = res.get("lifeSpan", {}).get("value", "")
                occupation_label = res.get("occupationLabel", {}).get("value", "")
                # print(f"Person Label: {person_label}")
                # print(f"Life Span: {life_span}")
                # print(f"Occupation Label: {occupation_label}")
                # print("=" * 30)
            return "Results printed to console."

        except Exception as e:
            return f"An error occurred: {str(e)}"

    def checkName(self, name):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = """SELECT ?item ?label
                WHERE {
                  ?item wdt:P31 wd:Q5;
                        rdfs:label ?label.
                  FILTER(STRSTARTS(?label, '"""+name+"""')).
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],it,en". }
                }
                LIMIT 1"""
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)
            for res in my_res["results"]["bindings"]:
                itemIdFull = res.get("item", {}).get("value", "")
                itemId = itemIdFull.split("/")[-1]
                label = res.get("label", {}).get("value", "")
                #print(f"ItemId: {itemId}")
                #print(f"label: {label}")
                #print("=" * 30)
            return {"ItemId": itemId, "Label": label}
        except:
            return ""

    def checkPlace(self, name):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = """SELECT ?item ?label
                   WHERE {
                     ?item wdt:P31 wd:Q515;
                           rdfs:label ?label.
                     FILTER(STRSTARTS(?label, '""" + name + """')).
                     SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],it,en". }
                   }
                   LIMIT 1"""
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)
            for res in my_res["results"]["bindings"]:
                itemIdFull = res.get("item", {}).get("value", "")
                itemId = itemIdFull.split("/")[-1]
                label = res.get("label", {}).get("value", "")
                # print(f"ItemId: {itemId}")
                # print(f"label: {label}")
                # print("=" * 30)
            return {"ItemId": itemId, "Label": label}
        except:
            return ""
    
    def isHuman(self,entity_id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = """SELECT ?itemLabel 
                WHERE 
                {
                wd:"""+entity_id+""" wdt:P31 ?item
                SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".}}"""
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)
            for res in my_res["results"]["bindings"]:
                label = res.get("itemLabel", {}).get("value", "")
                if label == "human":
                    return True
        except:
            return False
    
    def isLocation(self,entity_id):
        endpoint_url = "https://query.wikidata.org/sparql"
        query = """SELECT ?itemLabel 
                WHERE 
                {
                wd:"""+entity_id+""" wdt:P31 ?item
                SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".}}"""
        try:
            result = Result()
            my_res = result.get_results(endpoint_url, query)
            for res in my_res["results"]["bindings"]:
                label = res.get("itemLabel", {}).get("value", "")
                if label in ["city", "country", "state", "ocean", "planet", "sea"]:
                    return True
        except:
            return False
    
        #https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&sites=enwiki&titles=John%20Bauer&languages=en&formatversion=2
    def checkHumanEntity(self,name):
        endpointUrl = 'https://www.wikidata.org/w/api.php?action=query&format=json&list=search&formatversion=2&srsearch='
        encodedName = urllib.parse.quote(name)
        response = requests.get(endpointUrl + encodedName + '&srnamespace=0&srlimit=5&srinfo=totalhits&srprop=snippet')
        if response.status_code == 200:
            json_response = response.json()
            #print(json_response)
            id_list = []
            results = []
            id_snippets_list = []
            new_id_list = []
            for entity_key in json_response["query"]["search"]:
                id_list.append(entity_key["title"])
            
            for entity_id in id_list:
                if self.isHuman(entity_id):
                    id_snippets_list.append({"Id": entity_id, "Snippet": entity_key["snippet"]})
            
            results.append({"Id": id_snippets_list, "Name": name})
            #print(results)                      
        else:
            print("Request failed with status code:", response.status_code)
        
        return results

    def checkLocationEntity(self,loc):
        endpointUrl = 'https://www.wikidata.org/w/api.php?action=query&format=json&list=search&formatversion=2&srsearch='
        new_loc = self.removearticles(loc)
        print(new_loc)
        encodedLoc = urllib.parse.quote(new_loc)
        response = requests.get(endpointUrl + encodedLoc + '&srnamespace=0&srlimit=5&srinfo=totalhits&srprop=snippet')
        if response.status_code == 200:
            json_response = response.json()
            id_list = []
            results = []
            new_id_list = []
            for entity_key in json_response["query"]["search"]:
                id_list.append(entity_key["title"])
            for entity_id in id_list:
                if self.isLocation(entity_id):
                    new_id_list.append(entity_id)
            
            results.append({"Id": new_id_list, "Name": loc})
            #print(results)                      
        else:
            print("Request failed with status code:", response.status_code)
        
        return results    

        #Searching 'John Bauer'
        # https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&sites=enwiki%7Cdewiki%7Cfrwiki%7Ceswiki%7Citwiki&titles=John%20Bauer&props=info&languages=en%7Cit%7Cde&sitefilter=enwiki%7Ceswiki%7Citwiki%7Cfrwiki%7Cdewiki&formatversion=2

        #https://www.wikidata.org/w/api.php?action=query&format=json&list=search&formatversion=2&srsearch=John%20Bauer&srnamespace=0&srlimit=5&srinfo=totalhits&srprop=snippet

        #https://www.wikidata.org/w/api.php?action=query&format=json&prop=&list=search&formatversion=2&srsearch=Giovan%20Francesco%20Sagredo&srinfo=totalhits&srinterwiki=1&srenablerewrites=1&srsort=relevance