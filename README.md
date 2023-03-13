# irishbiography
 
Instructions for running:

curl -X POST http://192.168.0.61:9999/blazegraph/namespace/BeyondSample/sparql --data-urlencode 'query=SELECT * { ?s ?p ?o } LIMIT 1' -H 'Accept:application/json'

curl -X GET http://192.168.0.101:9999/blazegraph/namespace/BeyondSample/sparql --data-urlencode 'query=SELECT * { ?s ?p ?o } LIMIT 1' -H 'Accept:application/json'
