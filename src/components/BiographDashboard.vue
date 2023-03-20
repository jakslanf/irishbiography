<template>
  <div>
    <!-- <img :src=posts.results.bindings[2].photos.value width="200" height="200">
    <pre>{{posts.results.bindings[2].fullnamestring.value}}</pre> -->
    <Transition>
      <div v-if="isFetched">
        <button @click="isPopUp = true">Open Popup</button>
        <BiographyPopUp v-if="isPopUp" @close="togglePopUp">
          <template v-slot:header>
            <h1>{{popUpInfo.name}}</h1>
            <img :src=popUpInfo.imageUrl width="200" height="200" v-if="popUpInfo.imageUrl != ''">
            </template>
          <template v-slot:wikidata>

          <div v-if="popUpInfo.isWikiDataFetched">
            <h2>According to WikiData <a :href="popUpInfo.wikiLink">(View Here)</a>:</h2>
            <div v-for="item in popUpInfo.wikiData.results.bindings">
              <b><button>Approve</button>
                <a :href="item.prop.value">{{item.propLabel.value}}</a>: <a :href="item.value.value">{{item.valueLabel.value}}</a></b>
            </div>
          </div>
          </template>
        </BiographyPopUp>
        <div id="dash">
          <div id="individual" v-for="item in posts.results.bindings">
            <BiographyItem @click="getPopUp(item)" :full-name="item.fullnamestring.value" :photo="item.photos.value.split(',')[0]"/>
          </div>
        </div>
      </div>
      <h1 v-else>Loading...</h1>
    </Transition>
  </div>
</template>

<script>
import BiographyItem from "@/components/BiographyItem.vue";
import axios from 'axios';
import BiographyPopUp from "@/components/BiographyPopUp.vue";
import {ref} from "vue";


export default {
  components: {BiographyPopUp, BiographyItem},
  data() {
    let posts = [];
    return {
      BiographyPopUp,
      isPopUp: false,
      isFetched: false,
      isPopUpFetched: false,
      offset: 1,
      limit: 12,
      posts: [],
      errors: [],
      popUpInfo: {
        name: "Loading...",
        imageUrl: "",
        vtData: [],
        wikiData: [],
        isVtDataFetched: false,
        isWikiDataFetched: false,
        wikiLink: "",
        vtLink: "",
        dibLink: "",
      }
    }
  }, methods: {
    getPopUp(item) {
      this.popUpInfo.wikiLink = item.wikientity.value
      this.popUpInfo.vtLink = item.vturi.value
      this.popUpInfo.dibLink = item.diburi.value
      this.popUpInfo.name = item.fullnamestring.value
      if (item.photos.value === "") {
        this.popUpInfo.imageUrl = ""
      } else {
        this.popUpInfo.imageUrl = item.photos.value.split(',')[0]
      }
      this.popUpInfo.imageUrl = item.photos.value.split(',')[0]
      this.isPopUpFetched = false
      this.popUpInfo.isWikiDataFetched = false
      this.popUpInfo.isVtDataFetched = false
      this.getVtData(item)
      this.getWikiData(item)
      this.isPopUpFetched = true
      this.togglePopUp()
    },
    togglePopUp() {
      this.isPopUp = !this.isPopUp
    },
    async getVtData(item) {
      try {
        const response = await axios.post(
            'http://localhost:80/blazegraph/namespace/BeyondSample/sparql/',
            new URLSearchParams({
              'query': '## Querying VT for additional information\n' +
                  'PREFIX cidoc: <http://erlangen-crm.org/current/>\n' +
                  'PREFIX b2022: <https://ont.virtualtreasury.ie/ontology#>\n' +
                  'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>\n' +
                  'PREFIX owl:<http://www.w3.org/2002/07/owl#>\n' +
                  'PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
                  '\n' +
                  'SELECT *\n' +
                  'WHERE{\n' +
                  '  {<'+ item.vturi.value +'> ?prop ?value.} UNION\n' +
                  '  {?value ?prop <'+ item.vturi.value +'>.}\n' +
                  '  ?value rdfs:label ?label.\n' +
                  '}\n'
            }),
            {
              headers: {
                'Accept': 'application/json'
              }
            }
        );
        console.log(response.data)
        this.popUpInfo.vtData = response.data
        this.popUpInfo.isVtDataFetched = true;
      } catch (e) {
        this.errors.push(e)
      }
    },
    async getWikiData(item) {
      try {
        const response = await axios.post(
            'https://query.wikidata.org/sparql',
            new URLSearchParams({
              'query': 'SELECT\n' +
                  '  DISTINCT ?prop ?p ?propLabel ?value ?valueLabel\n' +
                  '# valueLabel is only useful for properties with item-datatype\n' +
                  'WHERE\n' +
                  '{\n' +
                  '  <'+ item.wikientity.value +'> ?p ?value\n' +
                  '  # change P1800 to another property\n' +
                  '  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }\n' +
                  '  VALUES ?p {\n' +
                  '    wdt:P19\n' +
                  '    wdt:P21\n' +
                  '    wdt:P22\n' +
                  '    wdt:P25\n' +
                  '    wdt:P26\n' +
                  '    wdt:P27\n' +
                  '    wdt:P39\n' +
                  '    wdt:P40\n' +
                  '    wdt:P69\n' +
                  '    wdt:P97\n' +
                  '    wdt:P102\n' +
                  '    wdt:P106\n' +
                  '    wdt:P108\n' +
                  '    wdt:P140\n' +
                  '    wdt:P800\n' +
                  '    wdt:P485\n' +
                  '    wdt:P451\n' +
                  '    wdt:P166\n' +
                  '    wdt:P213\n' +
                  '  }\n' +
                  '  ?prop wikibase:directClaim ?p\n' +
                  '}ORDER BY ?prop\n' +
                  '# remove or change limit for more results\n' +
                  'LIMIT 100'
            }),
            {
              headers: {
                'Accept': 'application/json'
              }
            }
        );
        console.log(response.data)
        this.popUpInfo.wikiData = response.data
        this.popUpInfo.isWikiDataFetched = true;
      } catch (e) {
        this.errors.push(e)
      }
    }
  },

  // Fetches posts when the component is created.
  async created() {
    try {
      this.limit
      const response = await axios.post(
          'http://localhost:80/blazegraph/namespace/BeyondSample/sparql/',
          new URLSearchParams({
            'query': 'PREFIX cidoc: <http://erlangen-crm.org/current/>\n' +
                'PREFIX b2022: <https://ont.virtualtreasury.ie/ontology#>\n' +
                'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>\n' +
                'PREFIX owl:<http://www.w3.org/2002/07/owl#>\n' +
                'PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
                'SELECT ?diburi ?vturi ?name ?fullnamestring ?wikientity (GROUP_CONCAT(DISTINCT ?photo; SEPARATOR=", ") AS ?photos)\n' +
                'WHERE\n' +
                '{\n' +
                '  {SELECT ?diburi ?vturi ?name ?fullnamestring ?wikientity\n' +
                '  WHERE{\n' +
                '  ?diburi cidoc:P71_lists ?vturi.\n' +
                '  ?diburi cidoc:P2_has_type b2022:DIB.\n' +
                '  ?vturi cidoc:P1_is_identified_by ?name.\n' +
                '  ?name rdfs:label ?fullname.\n' +
                '  ?vturi owl:sameAs ?wikientity.\n' +
                '  FILTER(CONTAINS(?fullnamestring, ", ")).\n' +
                '  BIND(REPLACE(STR(?fullname), "\\\\(|\\\\)", "", "i") AS ?fullnamestring).\n' +
                '  FILTER(regex(str(?diburi), "www.dib.ie" ) ).\n' +
                '  }ORDER BY(UCASE(str(?fullnamestring)))\n' +
                'LIMIT ' + this.limit.toString() + '\n' +
                'OFFSET'+ (this.offset*12).toString() + '}\n' +
                '  SERVICE <https://query.wikidata.org/sparql>{OPTIONAL {?wikientity  wdt:P18 ?photo.}}\n' +
                '} GROUP BY ?diburi ?vturi ?name ?fullnamestring ?wikientity\n' +
                'ORDER BY(UCASE(str(?fullnamestring)))'
          }),
          {
            headers: {
              'Accept': 'application/json'
            }
          }
      );
      this.posts = response.data
      console.log(this.posts)
      this.isFetched = true
    } catch (e) {
      this.errors.push(e)
    }
  },
}
</script>

<style scoped>
#dash {
  background-color: green;
  height: 900px;
  width: 1000px;
  padding: 10px;
  float: left;

}

#individual {
  background-color: #5A5A5A;
  width: 230px;
  height: 250px;
  float: left;
  padding: 10px;
  margin-right: 15px;
  margin-bottom: 15px;
  border-radius: 25px;
  word-wrap: normal;
  text-align: center;
  transition: transform .2s; /* Animation */
}

#individual:hover {
  transform: scale(1.1); /* (150% zoom - Note: if the zoom is too large, it will go outside of the viewport) */
}

.v-enter-active,
.v-leave-active {
  transition: opacity 2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>