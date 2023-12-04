def checkEntityType(id):
    return """
            SELECT ?instanceOfLabel
            WHERE {
                    wd:"""+id+""" wdt:P31 ?instanceOf.
              
              SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            }
            """

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

          SELECT ?officialName ?countryLabel ?regionLabel ?population ?flag
          WHERE {
            BIND(wd:"""+id+""" AS ?city)
            
            OPTIONAL {
              ?city wdt:P1448 ?officialName.
              OPTIONAL {
                ?city wdt:P17 ?country.
                ?country rdfs:label ?countryLabel.
                FILTER(LANG(?countryLabel) = "en")
              }
            }
            OPTIONAL{
              ?city wdt:P1376 ?region.
              ?region rdfs:label ?regionLabel. 
              FILTER(LANG(?regionLabel) = "en")
            }
            OPTIONAL{
              ?city wdt:P41 ?flag.
            }
            OPTIONAL {
              ?city wdt:P1082 ?population.
            }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
          }
          LIMIT 1   
        """