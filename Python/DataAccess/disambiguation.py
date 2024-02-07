from flask import jsonify
from refined.inference.processor import Refined

class Disambiguation():
    def __init__(self):
        pass

    def convertText(self, text):
        refined = Refined.from_pretrained(model_name="wikipedia_model", entity_set="wikidata", data_dir="./data_model")
        spans = refined.process_text(text)
        # print("spans", str(spans))
        entities = []
        entity_list = []
        for span in spans:
            entity_id = span.predicted_entity.wikidata_entity_id
            candidate_list = span.candidate_entities
            for item in candidate_list:
                if item[0].startswith("Q"):
                    entity_list.append(item[0])
            entity_name = span.text
            entity_type = span.coarse_mention_type
            if entity_id is not None and entity_name is not None and entity_type is not None:
                entities.append([{"Name":entity_name, "ID":entity_id, "Type": entity_type, "Candidates": entity_list}])
            elif entity_id is not None and entity_name is not None and entity_type is None:
                entity_type = span.predicted_entity_types[0][1].capitalize()
                entities.append([{"Name":entity_name, "ID":entity_id, "Type": entity_type, "Candidates": entity_list}])
        return entities