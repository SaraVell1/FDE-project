
def personQuery(id):
    return """PREFIX wd: <http://www.wikidata.org/entity/>
            PREFIX wdt: <http://www.wikidata.org/prop/direct/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX schema: <http://schema.org/>

            SELECT ?personLabel ?lifeSpan ?occupationLabel
            WHERE{
              BIND(""" + id + """ AS ?person)
              OPTIONAL{
                {?person wdt:P569 ?dateOfBirth.}
                {?person wdt:P570 ?dateOfDeath.}
                {?person wdt:P106 ?occupation.
                ?occupation rdfs:label ?occupationLabel}
                FILTER(LANG(?occupationLabel) = "en") 
              }
              BIND(CONCAT(STR( ?dateOfBirth), ' - ', STR( ?dateOfDeath) ) AS ?lifeSpan ) .
              SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
            }
            LIMIT 1"""
