<template>
  <div>
    <pre>{{posts}}</pre>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      posts: [],
      errors: []
    }
  },

  // Fetches posts when the component is created.
  async created() {
    try {
      console.log("zowee")
      const response = await axios.post(
          'http://localhost:80/blazegraph/namespace/BeyondSample/sparql/',
          new URLSearchParams({
            'query': 'PREFIX cidoc: <http://erlangen-crm.org/current/>\n' +
                'PREFIX b2022: <https://ont.virtualtreasury.ie/ontology#>\n' +
                'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>\n' +
                'PREFIX owl:<http://www.w3.org/2002/07/owl#>\n' +
                'PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
                'SELECT ?s ?o ?name ?fullnamestring ?wikientity (GROUP_CONCAT(DISTINCT ?photo; SEPARATOR=", ") AS ?photos)\n' +
                'WHERE\n' +
                '{\n' +
                '  {SELECT ?s ?o ?name ?fullnamestring ?wikientity\n' +
                '  WHERE{\n' +
                '  ?s cidoc:P71_lists ?o.\n' +
                '  ?s cidoc:P2_has_type b2022:DIB.\n' +
                '  ?o cidoc:P1_is_identified_by ?name.\n' +
                '  ?name rdfs:label ?fullnamestring.\n' +
                '  ?o owl:sameAs ?wikientity.\n' +
                '  FILTER(CONTAINS(?fullnamestring, ", ")).\n' +
                '  FILTER(regex(str(?s), "www.dib.ie" ) ).\n' +
                '  }order by asc(UCASE(str(?fullnamestring)))\n' +
                '\tLIMIT 10\n' +
                '\tOFFSET 0}\n' +
                '  SERVICE <https://query.wikidata.org/sparql>{OPTIONAL {?wikientity  wdt:P18 ?photo.}}\n' +
                '} GROUP BY ?s ?o ?name ?fullnamestring ?wikientity'
          }),
          {
            headers: {
              'Accept': 'application/json'
            }
          }
      );
      this.posts = response.data
      console.log(response.data)
      console.log("wowee")
    } catch (e) {
      this.errors.push(e)
    }
  }
}
</script>

<style scoped>

</style>