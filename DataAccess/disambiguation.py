import json
import stanza
import en_core_web_lg
from flask import jsonify
from refined.inference.processor import Refined
import spacy


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
        return jsonify(entities)
