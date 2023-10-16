import json
import stanza
from flask import jsonify

from DataAccess.wikiquery import Result


class Disambiguation():
    def __init__(self):
        pass
    
    def checkEntities(self, text):
        pipe = stanza.Pipeline("en", processors="tokenize,ner", package={"ner": ["ontonotes", "UCSY", "WikiNER"]})
        doc = pipe(text)
        entities = []
        for ent in doc.ents:
            entity_dict = {
                "text": ent.text,
                "type": ent.type,
            }
            if(entity_dict["type"] == 'GPE' or entity_dict["type"] == 'PERSON' or entity_dict["type"] == 'LOC'):
                entities.append(entity_dict)

        return json.dumps(entities)

    def convertText(self, text):
        findId = Result()
        entities_json = self.checkEntities(text)
        entities = json.loads(entities_json)

        unique_names = set()
        # unique_names_person = set()
        # unique_names_city = set()
        # print(entities)
        for entity in entities:
            if entity["type"] == "PERSON" or entity["type"] == "GPE" or entity["type"] == "LOC":
                unique_names.add(entity["text"])
            #     unique_names_person.add(entity["text"])
            # elif entity["type"] == "GPE" or entity["type"] == "LOC":
            #     unique_names_city.add(entity["text"])

        # entity_person = list(unique_names_person)
        # entity_city = list(unique_names_city)
        entity_list = list(unique_names)
       

        ids_entity = []
        #ids_city = []

        # for name in entity_person:
        #     my_check = findId.checkName(name)
        #     if my_check != "":
        #         ids_name.append(my_check)

        # for city in entity_city:
        #     my_check_city = findId.checkPlace(city)
        #     if my_check_city != "":
        #         ids_city.append(my_check_city)

        
        for name in entity_list:
            my_check = findId.checkEntity(name)
            ids_entity.extend(my_check)
            # if my_check != "":
            #     ids_name.append(my_check)

        # return jsonify({"Persons' ids": ids_name, "Cities' ids": ids_city})

        return jsonify(ids_entity)
