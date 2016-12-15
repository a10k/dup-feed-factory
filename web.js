//////////////////////////////////////
// Deloite University Press         //
// 2016(c)                          //
// Title: RSS Feed Factory          //
// Author: Alok Pepakayala          //
// Architect: Troy Bishop           //
//                                  //                                           
//////////////////////////////////////


// Required libraries
var fs = require('fs');
var express = require('express');
var http = require('http');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var moment = require('moment');
var RSS = require('rss');
var request = require('request');
var _ = require('underscore');

// Initialize
var app = express();
app.use(express.static('public'));


// Global vars
var global = {};
// global.masterXml
 global.lastUpdated = new Date("1/1/1970");
 global.AEMXMLSERVED = '';

/*
Available fields for user:
### INDUSTRIES
- [ ] Consumer Business 
- [ ] Energy & Resources
- [ ] Financial Services
- [ ] Life Sciences & Health Care
- [ ] Manufacturing
- [ ] Public Sector
- [ ] Technology, Media, & Telecommunications

### TOPICS
- [ ] Analytics
- [ ] Emerging Technologies
- [ ] Innovation
- [ ] Leadership
- [ ] Risk Management
- [ ] Social Impact
- [ ] Strategy & Operations
- [ ] Talent

### SPECIAL FOCUS
- [ ] 3D Opportunity
- [ ] Behavioral Economics & Management
- [ ] Economic Outlook
- [ ] Future of Mobility
- [ ] Industry 4.0
- [ ] Internet of Things
- [ ] Multimedia

*/









var listedSubTitles = {
  //ALL for Interactive display (Joanie)
  "all":"Recently published content",
  //Industries
  "consumer-business":"Consumer Business",
  "energy-resources":"Energy & Resources",
  "financial-services":"Financial Services",
  "life-sciences-and-health-care":"Life Sciences & Health Care",
  "manufacturing":"Manufacturing",
  "public-sector":"Public Sector",
  "technology-media-and-telecommunications":"Technology, Media, & Telecommunications",
  //specialFocus
  "3d-opportunity":"3D Opportunity",
  "industry-4-0":"Industry 4.0",
  "economic-outlook":"Economic outlook",
  "behavioral-economics-and-management":"Behavioral economics & management",
  "future-of-mobility": "Future of Mobility",
  "multimedia":"Multimedia",
  "internet-of-things":"Internet of Things",
  //Topics
  "analytics":"Analytics",
  "emerging-technologies":"Emerging Technologies",
  "innovation":"Innovation",
  "leadership":"Leadership",
  "risk-management":"Risk Management",
  "social-impact":"Social Impact",
  "strategy-and-operations":"Strategy & Operations",
  "talent":"Talent",
}
var listedSubs = {
  //ALL for Interactive display (Joanie)
  "Recently published content":[],
  //Industries
  "Consumer Business":['Consumer Loyalty',
            'Consumer Products',
            'Consumer Spending',
            'Customer Retention',
            'Customer Service',
            'Restaurants & Food Service',
            'Retail & Distribution',
            'Travel, Hospitality, and Leisure',
            'eCommerce',
            'Marketing'],
  "Energy & Resources":['Alternative Energy',
            'Center for Energy Solutions',
            'Energy & Resources',
            'Oil & Gas',
            'Power',
            'Sustainability',
            'Water'],
  "Financial Services":['Banking & Securities',
            'Center for Financial Services',
            'Financial Services',
            'Financial Technology',
            'Investment Management',
            'Private Equity',
            'Wealth Management/Private Banking'],
  "Life Sciences & Health Care":['Center for Health Solutions',
            'Digital Health',
            'Health Care',
            'Health Care Providers',
            'Health Care Reform',
            'Health Information Technology',
            'Health Insurance',
            'Health Plans',
            'Life Sciences',
            'Pharmaceutical'],
  "Manufacturing":["3D Opportunity",
            "3D Printing",
            "Additive Manufacturing",
            "Advanced manufacturing",
            "Automotive",
            "Industrial Products and Services",
            "Industry 4.0",
            "Manufacturing",
            "Manufacturing Competitiveness",
            "Aerospace and Defense"],
  "Public Sector":["Education",
            "Federal Government ",
            "Government",
            "Public policy",
            "Public Sector",
            "Public-private partnerships",
            "State Government",
            "Regulation and reform"],
  "Technology, Media, & Telecommunications":["Media & Entertainment",
            "Technology, Media & Telecommunications",
            "Mobile",
            "Technology Industry",
            "Telecommunications"],
  //specialFocus
  "3D Opportunity":['3D Opportunity'],
  "Industry 4.0":['Industry 4.0'],
  "Economic outlook":['Asia Pacific Economic Outlook',
            'Behind the Numbers',
            'Economic Outlook',
            'Global Economic Outlook',
            'Issues by the Numbers',
            'US Economic Forecast'],
  "Behavioral economics & management":['Behavioral economics and management'],
  "Future of Mobility": ['Future of Mobility'],
  "Multimedia":['Infographic',
            'Interactive',
            'Podcasts',
            'Video'],
  "Internet of Things":['Internet of Things'],
  //topics
  "Analytics":['Analytics',
            'Big Data',
            'Deloitte Analytics'],
  "Emerging Technologies":['Artificial intelligence (AI)',
            'Automation',
            'Blockchain',
            'Cloud',
            'Cognitive technologies',
            'Emerging technologies',
            'Exponential Technology',
            'Industry 4.0',
            'Information Management',
            'Information Technology',
            'Internet of Things',
            'Mobile',
            'Tech Trends',
            'Technology',
            'Technology Industry',
            'eCommerce',
            'Chief Information Officer',
            'Digital Transformation',
            'Social Media'],
  "Innovation":['Business Model Transformation',
            'Center for the Edge',
            'Disruptive innovation',
            'Gamification',
            'Innovation',
            'Patterns of Disruption Case Studies',
            'Product Innovation'],
  "Leadership":['Chief Executive Officer (CEO)',
            'Chief Financial Officer (CFO)',
            'Chief Human Resources Officer (CHRO)',
            'Chief Information Officer',
            'Chief Marketing Officer (CMO)',
            'Chief Operating Officer (COO)',
            'Chief Procurement Officer (CPO)',
            'Chief Risk Officer (CRO)',
            'C-suite',
            'Executive Transitions',
            'Executives',
            'Leadership',
            'Succession Planning'],
  "Risk Management":['Crisis Management',
            'Enterprise Risk Management',
            'Risk',
            'Chief Risk Officer (CRO)',
            'Cyber Risk'],
  "Social Impact":['Corporate Responsibility',
            'Social Business',
            'Social Impact',
            'Sustainability'],
  "Strategy & Operations":['Change Management',
            'Corporate Development',
            'Digital Transformation',
            'Growth',
            'Mergers & Acquisitions',
            'Operations',
            'Pricing & Profitability Management',
            'Revenue Growth',
            'Strategy',
            'Supply Chain',
            'Chief Operating Officer (COO)',
            'Business Model Transformation',
            'Chief Executive Officer (CEO)',
            'Compliance',
            'Divestitures & Separations',
            'Finance Transformation',
            'Financial Advisory',
            'Intellectual Property',
            'M&A Transaction Services',
            'Marketing',
            'Signals for Strategists'],
  "Talent":['Compensation and Benefits',
            'Diversity',
            'Employee engagement',
            'HR Strategy',
            'Human Capital',
            'Human Capital Trends',
            'Retention',
            'Work Environments',
            'Chief Human Resources Officer (CHRO)',
            'Performance management',
            'Talent']
};

















var readXMLFile = function(processAndSendResponse,choosenFeed,numberOfDays,req,res) {
  //var xml = fs.readFileSync(__dirname + '/dup-us-en.xml', 'utf8');
  request('https://dupress.deloitte.com/content/dam/dup-us-en/snp/dup-us-en.xml?nc='+ moment().unix() , function (error, response, xml) {
    if (!error && response.statusCode == 200) {
      console.log('https://dupress.deloitte.com/content/dam/dup-us-en/snp/dup-us-en.xml?nc='+ moment().unix());
      //fs.writeFile('xml.xml', xml);
      parser.parseString(xml, function(err, result) {
        global.AEMXMLSERVED = result.records['$']['timestamp'];
        var records = result.records.record;
        records = records.filter(function(item) {
          if (item['content-type'] == "Article" ||
            item['content-type'] == "Interactive" ||
            item['content-type'] == "Infographic" ||
            item['content-type'] == "Podcast" ||
            item['content-type'] == "Video"
          ) {
            return true;
          }
        });

        var processedRecords = [];
        records.map((item) => {
          var prefixedTitle = '';
          var normalTitle = (item.title && item.title[0]) || ''; 
          normalTitle = normalTitle.replace('(Interactive) ','');
          normalTitle = normalTitle.replace('(Infographic) ','');
          normalTitle = normalTitle.replace('(Podcast) ','');
          normalTitle = normalTitle.replace('(Video) ','');
          
          if (item['content-type'] == "Interactive" ||
            item['content-type'] == "Infographic" ||
            item['content-type'] == "Podcast" ||
            item['content-type'] == "Video"
          ){
            prefixedTitle = '(' + item['content-type'] + ') ';
          }
          prefixedTitle = prefixedTitle + normalTitle;
          var data = {
            'title' : prefixedTitle,
            'subTitle': item['sub-title'] && item['sub-title'][0],
            'url': item['url'] && item['url'][0] && item['url'][0].replace('/content/dupress','https://dupress.deloitte.com'),
            'description': item['desc'] && item['desc'][0],
            'guid': item['pageID'] && item['pageID'][0],
            'categories': item['cq-tag-name'] && item['cq-tag-name'][0] && item['cq-tag-name'][0].replace(/_us;en/g,'').split('|'),
            'date': new Date(item['date-published'][0]),
            'type': item['content-type'] && item['content-type'][0],
             custom_elements: [
                  {'type': item['content-type'] && item['content-type'][0]},
                  {'cta': item['cta'] && item['cta'][0]},
                  {'thumbnail':item['thumbnail'] && item['thumbnail'][0] && ('https://dupress.deloitte.com' + item['thumbnail'][0]+'/jcr:content/renditions/cq5dam.web.120.120.jpeg')}
                ]
            };
          processedRecords.push(data);
        });

        // ARRAY IS NOW READY!!
        global.masterXml = processedRecords;
        global.lastUpdated = new Date();
        console.log('FEED UPDATED:',global.lastUpdated,global.AEMXMLSERVED);
        processAndSendResponse(choosenFeed,numberOfDays,req,res);
      });
    }
  })
};









app.get('/:feed/:days/rss.xml', function(req, res) {
  var choosenFeed = req.params.feed;
  var numberOfDays = req.params.days;
  
  //DO WE PULL THE XML AGAIN?
  if(global.lastUpdated < moment().subtract(2,'minute')){
    readXMLFile(processAndSendResponse,choosenFeed,numberOfDays,req,res);
    //^this function handles the response too
  }else{
    processAndSendResponse(choosenFeed,numberOfDays,req,res);
  }

});



var processAndSendResponse = function(choosenFeed,numberOfDays,req,res){

  //Filter date...
    var ex;
    ex = global.masterXml.filter((item) => {
      if(item.date >= moment().startOf('day').subtract(numberOfDays,"days")){
        return true;
      }
    });
    ex = ex.sort(function(a, b){
        var keyA = new Date(a.date),
            keyB = new Date(b.date);
        // Compare the 2 dates
        if(keyA < keyB) return 1;
        if(keyA > keyB) return -1;
        return 0;
    });






    //Filter by tags...
    var choosenFeedTitle = listedSubTitles[choosenFeed];
    var listedTags = listedSubs[choosenFeedTitle];
    listedTags = listedTags.map(item=>item.toLowerCase().replace(/\s*\(.*?\)\s*/g,'').replace(/[, .]/g,'-').replace(/&/g,'and'));
    if(choosenFeed !== 'multimedia'){
      if(choosenFeed !== 'all'){
        //Filter for normal feeds
        ex = ex.filter(item=>{
          var intersection = _.intersection(listedTags,item.categories);
          if(intersection.length){
            return true;
          }
        });
      }
    }else{
      ex = ex.filter(item=>{
        var intersection = _.intersection(listedTags,[item.type.toLowerCase()]);
        if(intersection.length){
          return true;
        }
      });
    }



    //Create a feed...
    var feedoptions = {
        title: `Deloitte University Press: ${choosenFeedTitle}`,
        description: `Showing latest content for: ${choosenFeedTitle} from AEM XML Dated: ${global.AEMXMLSERVED}`,
        feed_url: `http://dup-rss-feeds.herokuapp.com/${choosenFeed}/7/rss.xml`,
        site_url: 'https://dupress.deloitte.com',
        copyright: 'Copyright © 2016 Deloitte Development LLC. All rights reserved.',
        language: 'en-us',
        generator:'DUP RSS FEED',
        categories: listedSubs[choosenFeedTitle],
    };
    var feed = new RSS(feedoptions);
    ex.map(function(item){
      var varUrl = item.url;
      varUrl = varUrl.replace(/(\?id=.*$)/,'');
      varUrl = varUrl + '?id=us:2em:3pa:' + choosenFeed + ':eng:dup:' + moment().format('MMDDYY');
      item.url = varUrl;
      feed.item(item)
    })

    if(ex.length > 0){
      var xml = feed.xml({indent:true});
      res.type('rss');
      res.send(xml);
    }else{
     res.status(404).send('404: NO RECENT CONTENT');
    }
}















// Listen to server port
app.listen(process.env.PORT || 3000, function () {/*SERVER STARTED*/});
