const eraData = [
  {
    "Era": "Bronze Age",
    "First Display Year": "-2,500",
    "Last Display Year": "-1,100",
    "Blurb": "Occupation of the site extended around a natural harbor as well as along the existing thalweg.",
    "Timeline increments": "1000 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Iron Age",
    "First Display Year": -1000,
    "Last Display Year": -334,
    "Blurb": "Occupation of the site extended south along the thalweg as well as along the shoreline to the east and west.",
    "Timeline increments": "1000 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Hellenistic Period",
    "First Display Year": -333,
    "Last Display Year": -65,
    "Blurb": "The site begins to take urban shape with rectilinear streets going north/south and defensive walls and towers.",
    "Timeline increments": "500 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Roman Period",
    "First Display Year": -64,
    "Last Display Year": 550,
    "Blurb": "Although the city is mentioned in Egyptian records of the 2nd millennium bce, it did not gain prominence until it was granted the status of a Roman colony, the Colonia Julia Augusta Felix Berytus, in 14 BCE.",
    "Timeline increments": "500 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Jund Dimashq Rule",
    "First Display Year": 635,
    "Last Display Year": 1109,
    "Blurb": "The Roman city was destroyed by a succession of earthquakes, culminating in the quake and tidal wave of 551 ce. When Muslim conquerors occupied Beirut in, it was still mostly in ruins.",
    "Timeline increments": "500 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Kingdom of Jerusalem Rule",
    "First Display Year": 1110,
    "Last Display Year": 1290,
    "Blurb": "In 1110, Beirut was conquered by the military forces of the First Crusade and was organized, along with its coastal suburbs, as a fief of the Latin Kingdom of Jerusalem.",
    "Timeline increments": "500 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Mamluk Rule",
    "First Display Year": 1291,
    "Last Display Year": 1515,
    "Blurb": "Under Mamlūk rule, Beirut became the chief port of call in Syria for the spice merchants from Venice.",
    "Timeline increments": "500 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Ottoman 1st Rule",
    "First Display Year": 1516,
    "Last Display Year": 1597,
    "Blurb": "Beirut, along with the rest of Syria, passed under Ottoman rule in 1516, shortly after the Portuguese had rounded the African continent (1498) to divert the spice trade of the East away from Syria and Egypt.",
    "Timeline increments": "500 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Mount Lebanon Rule",
    "First Display Year": 1598,
    "Last Display Year": 1774,
    "Blurb": "Between 1598 and 1633 and again between 1749 and 1774, it fell under the control of the Maʿn and Shihāb emirs of the Druze and Maronite mountain hinterland.",
    "Timeline increments": "100 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Ottoman 2nd Rule",
    "First Display Year": 1775,
    "Last Display Year": 1831,
    "Blurb": "During the Russo-Turkish War of 1768–74, Beirut suffered heavy bombardment by the Russians. Subsequently, it was wrested from the Shihāb emirs by the Ottomans, and it soon shrank into a village of about 6,000 people.",
    "Timeline increments": "50 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Egyptian Rule",
    "First Display Year": 1832,
    "Last Display Year": 1840,
    "Blurb": "The occupation of Syria by the Egyptians under Muḥammad Ali Pasha provided the needed stimulus for the town to enter on its new period of commercial growth.",
    "Timeline increments": "10 years",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Ottoman 3rd Rule",
    "First Display Year": 1841,
    "Last Display Year": 1919,
    "Blurb": "By 1848, Beirut began to outgrow its walls, and its population had increased to about 15,000. Civil wars in neighboring mountains swelled the city's population, as Christian refugees arrived in large numbers.",
    "Timeline increments": "1 year",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Colonial Rule",
    "First Display Year": 1920,
    "Last Display Year": 1925,
    "Blurb": "Beirut was occupied by the Allies at the end of World War I, and the city was established by the French mandatory authorities in 1920 as the capital of the State of Greater Lebanon.",
    "Timeline increments": "1 year",
    "Notes": "",
    "Attachments": ""
  },
  {
    "Era": "Lebanese Republic",
    "First Display Year": 1926,
    "Last Display Year": "Present",
    "Blurb": "In 1926, Beirut became the capital of the Lebanese Republic, a status it has since kept.",
    "Timeline increments": "1 year",
    "Notes": "",
    "Attachments": ""
  }
];

const eras = [];

eraData.forEach(function (era) {
  let newObj = {
    name: era.Era,
    dates: [
      parseInt(era['First Display Year'].toString().replace(',','')),
      parseInt(era['Last Display Year'].toString().replace(',',''))
    ],
    description: era.Blurb,
    increment: parseInt(era['Timeline increments'].replace(/\D/g, '')),
    notes: era.Notes,
    attachments: era.Attachments
  }
  eras.push(newObj);
});

eras[eras.length-1].dates[1] = new Date().getFullYear();