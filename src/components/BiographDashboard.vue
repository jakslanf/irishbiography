<template>
  <div>
    <Transition>
      <div v-if="isFetched">
        <!-- Search features-->
        <button @click="backPage()">Previous Page</button>
        <button @click="nextPage()">Next Page</button>
        <input v-model="searchString" placeholder="Search Names"/>
        <select v-model="searchCategory">
          <option value="">Select Area of Interest</option>
          <option v-for="option in searchTerms.results.bindings" :value="option.area_of_interest_uri.value">
            {{ option.interest_name.value }}
          </option>
        </select>
        <button @click="goSearch()">Search</button>
        <!-- Pop up containing info that appears when a person is clicked-->
        <!-- Each template is a separate tab on the pop up. One corresponding with approved facts, virtual treasury facts and wikidata facts-->
        <BiographyPopUp v-if="isPopUp" @close="togglePopUp">
          <template v-slot:header>
            <h1>{{ popUpInfo.name }}</h1>
            <img :src=popUpInfo.imageUrl width="200" height="200" v-if="popUpInfo.imageUrl != ''">
            <h2><a :href="popUpInfo.dibLink">Read Biography on DIB</a></h2>
          </template>
          <!-- Approved Facts -->
          <template v-slot:approved>
            <div v-if="popUpInfo.isApprovedDataFetched">
              <h2>Approved by historians:</h2>
              <div v-for="item in popUpInfo.ApprovedData.results.bindings">
                <b>
                  <a :href="item.prop.value">{{ getVtPropertyLabel(item.prop.value) }}</a>: <a
                    :href="item.value.value">{{ item.label.value }}</a></b>
              </div>
            </div>
          </template>
          <!-- WikiData Facts -->
          <template v-slot:wikidata>
            <div v-if="popUpInfo.isWikiDataFetched">
              <h2>According to WikiData <a :href="popUpInfo.wikiLink">(View Here)</a>:</h2>
              <div v-for="item in popUpInfo.wikiData.results.bindings">
                <b>
                  <button @click="approveTriple(item, item.valueLabel.value)">Approve</button>
                  <a :href="item.prop.value">{{ item.propLabel.value }}</a>: <a
                    :href="item.value.value">{{ item.valueLabel.value }}</a></b>
              </div>
            </div>
          </template>
          <!-- VirtualTreasury Facts -->
          <template v-slot:treasury>
            <div v-if="popUpInfo.isVtDataFetched">
              <h2>According to the VirtualTreasury <a :href="popUpInfo.vtLink">(View Here)</a>:</h2>
              <div v-for="item in popUpInfo.vtData.results.bindings">
                <b>
                  <button @click="approveTriple(item, item.label.value)">Approve</button>
                  <a :href="item.prop.value">{{ getVtPropertyLabel(item.prop.value) }}</a>: <a
                    :href="item.value.value">{{ item.label.value }}</a></b>
              </div>
            </div>
          </template>
        </BiographyPopUp>
        <div id="dash">
          <!-- If search results fail -->
          <div v-if="!posts.results.bindings.length">No Person Found. Try a different search.</div>
          <div id="individual" v-for="item in posts.results.bindings">
            <BiographyItem @click="getPopUp(item)" :full-name="item.fullnamestring.value"
                           :photo="item.photos.value.split(',')[0]"/>
          </div>
        </div>
      </div>
      <!-- This code hides the dashboard items until the API retrieves them. -->
      <!-- If this fails to disappear, this means the API is not reaching Blazegraph -->
      <!-- Check IP is correct for Blazegraph in the reverse proxy configuration if so -->
      <h1 v-else v-if="!isInitialised">Loading...<br>Contact Finn if stuck at Loading</h1>
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
      <!-- Booleans used to ensure values are not displayed unless fully retrieved -->
      isInitialised: false,
      isPopUp: false,
      isFetched: false,
      isPopUpFetched: false,
      <!-- Strings used by user for searching -->
      searchString: "",
      searchCategory: "",
      <!-- What "page" of search results the dashboard is on -->
      offset: 0,
      <!-- How many items to display on a single page -->
      limit: 12,
      searchTerms: [],
      <!-- API call results and errors in the two below -->
      posts: [],
      errors: [],
      <!-- Collection of values related to popups -->
      popUpInfo: {
        name: "Loading...",
        imageUrl: "",
        <!-- Triples returned by API from each SPARQL endpoint -->
        vtData: [],
        wikiData: [],
        approvedData: [],
        <!-- Booleans to ensure properly retrieved before displaying -->
        isVtDataFetched: false,
        isWikiDataFetched: false,
        isApprovedDataFetched: false,
        wikiLink: "",
        vtLink: "",
        dibLink: "",
      }
    }
  }, methods: {
    <!-- Sets all values that need to be displayed on the pop up interface and queries each SPARQL endpoint -->
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
      this.popUpInfo.isApprovedDataFetched = false
      this.popUpInfo.isWikiDataFetched = false
      this.popUpInfo.isVtDataFetched = false
      this.getVtData(item)
      this.getWikiData(item)
      this.getApprovedData(item)
      this.isPopUpFetched = true
      this.togglePopUp()
    },
    <!-- Toggles Pop Up, used for interface buttons -->
    togglePopUp() {
      this.isPopUp = !this.isPopUp
    },
    <!-- Queries database for searched items -->
    goSearch() {
      this.offset = 0
      this.isFetched = false
      this.getDashItems()
    },
    <!-- Queries database for next page of searched items -->
    nextPage() {
      this.isFetched = false
      this.offset = this.offset + 1
      this.getDashItems()
    },
    <!-- Queries database for previous page of searched items -->
    backPage() {
      this.isFetched = false
      this.offset = this.offset - 1
      if (this.offset < 0) {
        this.offset = 0
      }
      this.getDashItems()
    },
    <!-- API call that inserts approved triples into the personal namespace -->
    async approveTriple(item, label)
    {
      try {
        const response = await axios.post(
            'http://localhost:80/blazegraph/namespace/PersonalGraph/sparql/',
            new URLSearchParams({
              'update': 'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#> INSERT DATA {\n' +
                  '  <'+ this.popUpInfo.vtLink +'> <' +item.prop.value+'> <'+item.value.value+'>.\n' +
                  '<'+item.value.value+'> rdfs:label "' + label +'".\n' +
                  '}'
            }),
            {
              headers: {
                'Accept': 'application/json'
              }
            }
        );
        console.log(response.data)
        console.log("Added triple")
        await this.addProvenance(item)
      } catch (e) {
        this.errors.push(e)
      }
    },
    <!-- API call that inserts provenance related triples into the personal namespace -->
    async addProvenance(item)
    {
      try {
        var uniqueID = new Date().valueOf();
        const response = await axios.post(
            'http://localhost:80/blazegraph/namespace/PersonalGraph/sparql/',
            new URLSearchParams({
              'update': "INSERT DATA\n" +
                  "{\n" +
                  "@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .\n" +
                  "@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n" +
                  "@prefix prov: <http://www.w3.org/ns/prov#> .\n" +
                  "@prefix :     <http://example.org#> .\n" +
                  "\n" +
                  ":approvalActivity"+ uniqueID +"\n" +
                  "    a prov:Activity;\n" +
                  "    :mentionsSubject " + this.popUpInfo.vtLink +";\n" +
                  "    :mentionsObject " + item.value.value +";\n" +
                  "    :mentionsRelationship \""+ item.prop.value +"\";\n" +
                  "    prov:wasAssociatedWith :historianWilde;\n" +
                  "    prov:wasGeneratedBy :webInterface;\n" +
                  "    prov:startedAtTime \"2011-07-14T01:01:01Z\"^^xsd:dateTime;\n" +
                  "    prov:endedAtTime      \"2011-07-14T02:02:02Z\"^^xsd:dateTime;\n" +
                  ".\n" +
                  "\n" +
                  ":historianWilde\n" +
                  "    a foaf:Person, prov:Agent;\n" +
                  "    foaf:givenName       \"Wilde\";\n" +
                  "    prov:actedOnBehalfOf :trinityCollege;\n" +
                  ".\n" +
                  "}"
            }),
            {
              headers: {
                'Accept': 'application/json'
              }
            }
        );
        console.log(response.data)
        console.log("Added triple")
      } catch (e) {
        this.errors.push(e)
      }
    },
    <!-- API call gets virtual treasury data from the Beyond2022 Sample Namespace -->
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
                  '  {<' + item.vturi.value + '> ?prop ?value.} UNION\n' +
                  '  {?value ?prop <' + item.vturi.value + '>.}\n' +
                  '  ?value rdfs:label ?label.\n' +
                  '} LIMIT 10\n'
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
    <!-- API call gets approved triples from the Personal Namespace -->
    async getApprovedData(item) {
      try {
        const response = await axios.post(
            'http://localhost:80/blazegraph/namespace/PersonalGraph/sparql/',
            new URLSearchParams({
              'query': '## Querying VT for additional information\n' +
                  'PREFIX cidoc: <http://erlangen-crm.org/current/>\n' +
                  'PREFIX b2022: <https://ont.virtualtreasury.ie/ontology#>\n' +
                  'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>\n' +
                  'PREFIX owl:<http://www.w3.org/2002/07/owl#>\n' +
                  'PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
                  '\n' +
                  'SELECT DISTINCT ?prop ?value ?label \n' +
                  'WHERE{\n' +
                  '<' + item.vturi.value + '> ?prop ?value.\n' +
                  '?value rdfs:label ?label.' +
                  '}\n'
            }),
            {
              headers: {
                'Accept': 'application/json'
              }
            }
        );
        console.log("Approved Data")
        console.log(response.data)
        this.popUpInfo.ApprovedData = response.data
        this.popUpInfo.isApprovedDataFetched = true;
      } catch (e) {
        this.errors.push(e)
      }
    },
    <!-- API call gets triples from WikiData's SPARQL Endpoint -->
    <!-- Limited to only a set amount of predicates -->
    async getWikiData(item) {
      try {
        const response = await axios.post(
            'https://query.wikidata.org/sparql',
            new URLSearchParams({
              'query': 'SELECT\n' +
                  '  DISTINCT ?prop ?p ?propLabel ?value ?valueLabel\n' +
                  'WHERE\n' +
                  '{\n' +
                  '  <' + item.wikientity.value + '> ?p ?value\n' +
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
                  'LIMIT 10'
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
    },
    async getDashItems() {
      try {
        let tempString;
        tempString = ""
        if(this.searchCategory !== "")
        {
          tempString = '?vturi b2022:DIB_area_of_interest <' + this.searchCategory + '>.\n'
        }
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
                  'FILTER(CONTAINS(UCASE(STR(?fullnamestring)),UCASE(STR("' + this.searchString + '")))).' +
                  '  ?diburi cidoc:P71_lists ?vturi.\n' +
                  '  ?diburi cidoc:P2_has_type b2022:DIB.\n' +
                  '  ?vturi cidoc:P1_is_identified_by ?name.\n' +
                  '  ?name rdfs:label ?fullname.\n' +
                  '  ?vturi owl:sameAs ?wikientity.\n' +
                  '  FILTER(CONTAINS(?fullnamestring, ", ")).\n' +
                  tempString +
                  '  BIND(REPLACE(STR(?fullname), "\\\\(|\\\\)", "", "i") AS ?fullnamestring).\n' +
                  '  FILTER(regex(str(?diburi), "www.dib.ie" ) ).\n' +
                  '  }ORDER BY(UCASE(str(?fullnamestring)))\n' +
                  'LIMIT ' + this.limit.toString() + '\n' +
                  'OFFSET' + (this.offset * 12).toString() + '}\n' +
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
        this.isInitialised = true
      } catch (e) {
        this.errors.push(e)
      }
    },
    async getAreasOfInterest() {
      try {
        const response = await axios.post(
            'http://localhost:80/blazegraph/namespace/BeyondSample/sparql/',
            new URLSearchParams({
              'query': 'PREFIX cidoc: <http://erlangen-crm.org/current/>\n' +
                  'PREFIX b2022: <https://ont.virtualtreasury.ie/ontology#>\n' +
                  'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>\n' +
                  'PREFIX owl:<http://www.w3.org/2002/07/owl#>\n' +
                  'PREFIX wdt: <http://www.wikidata.org/prop/direct/>\n' +
                  '\n' +
                  'SELECT DISTINCT ?area_of_interest_uri (SAMPLE(?area_of_interest_string) AS ?interest_name)\n' +
                  'WHERE{\n' +
                  '  ?person b2022:DIB_area_of_interest ?area_of_interest_uri.\n' +
                  '  ?area_of_interest_uri cidoc:P1_is_identified_by ?name.\n' +
                  '  ?name rdfs:label ?area_of_interest_string\n' +
                  '} GROUP BY(?area_of_interest_uri) ORDER BY ASC(UCASE(str(?area_of_interest_string))) '
            }),
            {
              headers: {
                'Accept': 'application/json'
              }
            }
        );
        this.searchTerms = response.data
        console.log(this.searchTerms)
      } catch (e) {
        this.errors.push(e)
      }
    },
    getVtPropertyLabel(property) {
      switch (String(property)) {
        case "https://ont.virtualtreasury.ie/ontology#DIB_area_of_interest":
          return "Area of Interest"
        case "http://erlangen-crm.org/current/P1_is_identified_by":
          return "Identified By"
        case "http://erlangen-crm.org/current/P107_has_current_or_former_member":
          return "Current/Former Member"
        case "http://erlangen-crm.org/current/P71_lists":
          return "Listed in"
        default:
          return String(property)
      }
    }
  },

  // Fetches posts when the component is created.
  async created() {
    this.getAreasOfInterest()
    this.getDashItems()
  },
}
</script>

<style scoped>
#dash {
  background-color: #3b3b3b;
  height: 900px;
  width: 1000px;
  padding: 10px;
  float: left;

}

#individual {
  background-color: #5A5A5A;
  color: white;
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