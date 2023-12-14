def personQuery(id):
    return """PREFIX wd: <http://www.wikidata.org/entity/>
            PREFIX wdt: <http://www.wikidata.org/prop/direct/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX schema: <http://schema.org/>

            SELECT ?personLabel ?personDesc ?genderLabel ?dateOfBirth ?placeBLabel  ?dateOfDeath ?placeDLabel(GROUP_CONCAT(DISTINCT ?occupationLabel; separator=", ") as ?occupationsLabels)  ?image ?viafID ?wiki_page
            WHERE{
              BIND( wd:"""+id+""" AS ?person)
              OPTIONAL{
                ?person wdt:P21 ?gender.
                ?gender rdfs:label ?genderLabel
                FILTER(LANG(?genderLabel) = "en")
              }
              OPTIONAL{
               ?person schema:description ?personDesc.
                FILTER(LANG(?personDesc) = "en")
                }
              OPTIONAL{
                ?person wdt:P569 ?dateOfBirth.
                }
              OPTIONAL{
                ?person wdt:P570 ?dateOfDeath.
                }
              OPTIONAL{
                ?person wdt:P106 ?occupation.
                ?occupation rdfs:label ?occupationLabel
                FILTER(LANG(?occupationLabel) = "en") 
                }
              OPTIONAL{
                ?person wdt:P19 ?placeOfBirth.
                ?placeOfBirth rdfs:label ?placeBLabel  
                FILTER(LANG(?placeBLabel) = "en")
              }
              OPTIONAL{
                ?person wdt:P20 ?placeOfDeath.
                ?placeOfDeath rdfs:label ?placeDLabel   
                FILTER(LANG(?placeDLabel) = "en")
              }
              OPTIONAL {
                ?person wdt:P18 ?image.
              }
              OPTIONAL {
                ?person wdt:P214 ?viafID.
              }
              OPTIONAL {
                  ?wiki_page schema:about ?person .
                  ?wiki_page schema:inLanguage "en" .
                  FILTER (SUBSTR(str(?wiki_page), 1, 25) = "https://en.wikipedia.org/")
                }
              SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
            }
        GROUP BY ?personLabel ?personDesc ?genderLabel ?dateOfBirth ?dateOfDeath ?image ?placeBLabel ?placeDLabel ?viafID ?wiki_page
        LIMIT 1"""

def locationQuery(id):
    return """
          PREFIX wd: <http://www.wikidata.org/entity/>
          PREFIX wdt: <http://www.wikidata.org/prop/direct/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX schema: <http://schema.org/>

          SELECT ?officialName ?locationDesc ?officialLanguageLabel ?currencyLabel ?population ?flag ?viafID ?wiki_page
          WHERE {
            BIND(wd:"""+id+""" AS ?location) 
            
            OPTIONAL {
              ?location wdt:P1448 ?officialName.
              }
             OPTIONAL{
               ?location schema:description ?locationDesc.
                FILTER(LANG(?locationDesc) = "en")
                }
            OPTIONAL {
              ?location wdt:P37 ?officialLanguage.
              ?officialLanguage rdfs:label ?officialLanguageLabel.
              FILTER(LANG(?officialLanguageLabel) = "en")
            }
            OPTIONAL{
              ?location wdt:P38 ?currency.
              ?currency rdfs:label ?currencyLabel. 
              FILTER(LANG(?currencyLabel) = "en")
            }
            OPTIONAL{
              ?location wdt:P41 ?flag.
            }
            OPTIONAL {
              ?location wdt:P1082 ?population.
            }
            OPTIONAL {
                ?location wdt:P214 ?viafID.
              }
            OPTIONAL {
                  ?wiki_page schema:about ?location.
                  ?wiki_page schema:inLanguage "en".
                  FILTER (SUBSTR(str(?wiki_page), 1, 25) = "https://en.wikipedia.org/")
                }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
          }
          LIMIT 1   
        """

def spaceObjQuery(id):
    return """
          PREFIX wd: <http://www.wikidata.org/entity/>
          PREFIX wdt: <http://www.wikidata.org/prop/direct/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX schema: <http://schema.org/>

          SELECT ?spaceObjLabel ?spaceObjDesc ?partOfLabel ?mass ?image ?viafID ?wiki_page
          WHERE {
            BIND(wd:"""+id+""" AS ?spaceObj) 
            
            OPTIONAL {
              ?spaceObj rdfs:label ?spaceObjLabel.
              FILTER(LANG(?spaceObjDesc) = "en")
              }
             OPTIONAL{
               ?spaceObj schema:description ?spaceObjDesc.
                FILTER(LANG(?spaceObjDesc) = "en")
                }
            OPTIONAL{
              ?spaceObj wdt:P361 ?partOf.
              ?partOf rdfs:label ?partOfLabel.
               FILTER(LANG(?partOfLabel) = "en")
            }
            OPTIONAL{
              ?spaceObj wdt:P2067 ?mass.
            }
            OPTIONAL{
              ?spaceObj wdt:P18 ?image.
            }
            OPTIONAL {
                ?spaceObj wdt:P214 ?viafID.
              }
            OPTIONAL {
                  ?wiki_page schema:about ?spaceObj.
                  ?wiki_page schema:inLanguage "en".
                  FILTER (SUBSTR(str(?wiki_page), 1, 25) = "https://en.wikipedia.org/")
                }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
          }
          LIMIT 1
          """
def defaultEntity(id):
  return """
          PREFIX wd: <http://www.wikidata.org/entity/>
          PREFIX wdt: <http://www.wikidata.org/prop/direct/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX schema: <http://schema.org/>

          SELECT ?entityLabel ?entityDesc ?image ?viafID ?wiki_page
          WHERE {
            BIND(wd:"""+id+""" AS ?entity) 
            
            OPTIONAL {
              ?entity rdfs:label ?entityLabel.
              FILTER(LANG(?spaceObjDesc) = "en")
              }
             OPTIONAL{
               ?entity schema:description ?entityDesc.
                FILTER(LANG(?entityDesc) = "en")
                }
            OPTIONAL{
              ?entity wdt:P18 ?image.
            }
            OPTIONAL {
                ?entity wdt:P214 ?viafID.
              }
            OPTIONAL {
                  ?wiki_page schema:about ?entity.
                  ?wiki_page schema:inLanguage "en".
                  FILTER (SUBSTR(str(?wiki_page), 1, 25) = "https://en.wikipedia.org/")
                }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
          }
          LIMIT 1
          """