import json
from xml.dom.minidom import Entity
import stanza
import spacy
import en_core_web_lg
from flask import jsonify
import datetime
from refined.inference.processor import Refined

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
    
    def compare_context_with_description(self, text, description):
        nlp = en_core_web_lg.load()
        doc1 = nlp(text)
        doc2 = nlp(description)
        return doc2.similarity(doc1)

    def convertText(self, text):
        refined = Refined.from_pretrained(model_name="wikipedia_model", entity_set="wikidata", download_files=False)
        spans = refined.process_text(text)
        my_spans = str(spans)
        print(my_spans)
        entities = []
        for span in spans:
            entity_id = span.predicted_entity.wikidata_entity_id
            entity_name = span.predicted_entity.wikipedia_entity_title
            entity_type = span.coarse_mention_type
            if entity_id is not None and entity_name is not None and entity_type is not None:
                entities.append([{"Name":entity_name, "ID":entity_id, "Type": entity_type}])
            elif entity_id is not None and entity_name is not None and entity_type is None:
                entities.append([{"Name":entity_name, "ID":entity_id}])
        return jsonify(entities)
        # findId = Result()
        # entities_json = self.checkEntities(text)
        # entities = json.loads(entities_json)
        # unique_person_names = set()
        # unique_location_names = set()
        # entity_dictionary = dict()
        # for entity in entities:
        #     match entity["type"]:
        #         case "PERSON":
        #             unique_person_names.add(entity["text"])                    
        #         case "LOC":
        #             unique_location_names.add(entity["text"])
        #         case "GPE":
        #             unique_location_names.add(entity["text"])
        #         case "ORG":
        #             print("I'm an organization")
        #         case "LANGUAGE":
        #             print("I'm a language")
        # entity_person_list = list(unique_person_names)
        # entity_location_list = list(unique_location_names)             
        # ids_location_entity = []  
        # final_name_id = []   
        # for name in entity_person_list:           
        #     #ids_person_entity = []
        #     my_name_check = findId.checkHumanEntity(name)
        #     print("My name check is:", my_name_check)
        #     #ids_person_entity.extend(my_name_check)
        #     id_snippet_verified = []

        #     for id_entry in my_name_check:
        #         if len(id_entry["Id"]) > 1:
        #             id_snippet_list = id_entry["Id"]
        #             for id_snippet in id_snippet_list:
        #                 snippet = id_snippet["Snippet"]
        #                 myres = self.compare_context_with_description(text, snippet)
        #                 id_snippet_verified.append({"ID": id_snippet["Id"], "Score": myres})

        #             if id_snippet_verified:
        #                 print("My Ids verfied are:", id_snippet_verified)
        #                 max_score_entry = max(id_snippet_verified, key=lambda x: x["Score"])
        #                 highest_score_id = max_score_entry["ID"]            
                        
        #             print(highest_score_id)
        #             final_name_id.append({"Name": name, "ID": highest_score_id})

        #         elif len(id_entry["Id"]) == 1:
        #             final_name_id.append({"Name": name, "ID": my_name_check[0]["Id"]})
                
        #         else:
        #             final_name_id.append({"Name": name, "ID": None})

        # for loc in entity_location_list:
        #     my_loc_check = findId.checkLocationEntity(loc)
        #     ids_location_entity.extend(my_loc_check)

        # print(final_name_id)
        # entity_dictionary["PERSON"] = final_name_id
        # entity_dictionary["LOCATION"] = ids_location_entity


       # print(entity_dictionary)

        #return jsonify(list(entity_dictionary.items()))
