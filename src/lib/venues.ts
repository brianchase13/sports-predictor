import { VenueInfo, Sport } from './types';

/**
 * Static venue data library for major sports venues
 * Images use Wikipedia Commons URLs (free to use)
 */
export const VENUE_DATA: Record<string, VenueInfo> = {
  // NBA Arenas
  'Madison Square Garden': {
    name: 'Madison Square Garden',
    city: 'New York',
    state: 'NY',
    capacity: 19812,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Madison_Square_Garden_%28exterior%29.jpg/320px-Madison_Square_Garden_%28exterior%29.jpg',
  },
  'Crypto.com Arena': {
    name: 'Crypto.com Arena',
    city: 'Los Angeles',
    state: 'CA',
    capacity: 19068,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crypto.com_Arena_1-8-2022.jpg/320px-Crypto.com_Arena_1-8-2022.jpg',
  },
  'Chase Center': {
    name: 'Chase Center',
    city: 'San Francisco',
    state: 'CA',
    capacity: 18064,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chase_Center_-_July_2019_%284869%29.jpg/320px-Chase_Center_-_July_2019_%284869%29.jpg',
  },
  'United Center': {
    name: 'United Center',
    city: 'Chicago',
    state: 'IL',
    capacity: 20917,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/United_Center_060716.jpg/320px-United_Center_060716.jpg',
  },
  'TD Garden': {
    name: 'TD Garden',
    city: 'Boston',
    state: 'MA',
    capacity: 19156,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/TD_Garden_-_panoramio_%284%29.jpg/320px-TD_Garden_-_panoramio_%284%29.jpg',
  },
  'Barclays Center': {
    name: 'Barclays Center',
    city: 'Brooklyn',
    state: 'NY',
    capacity: 17732,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Barclays_Center_western_side.jpg/320px-Barclays_Center_western_side.jpg',
  },
  'American Airlines Center': {
    name: 'American Airlines Center',
    city: 'Dallas',
    state: 'TX',
    capacity: 19200,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/American_Airlines_Center_%28Dallas%29.jpg/320px-American_Airlines_Center_%28Dallas%29.jpg',
  },
  'Ball Arena': {
    name: 'Ball Arena',
    city: 'Denver',
    state: 'CO',
    capacity: 19520,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Ball_Arena_Denver_2023.jpg/320px-Ball_Arena_Denver_2023.jpg',
  },
  'Paycom Center': {
    name: 'Paycom Center',
    city: 'Oklahoma City',
    state: 'OK',
    capacity: 18203,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Paycom_Center.jpg/320px-Paycom_Center.jpg',
  },
  'Toyota Center': {
    name: 'Toyota Center',
    city: 'Houston',
    state: 'TX',
    capacity: 18055,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Toyota_Center.jpg/320px-Toyota_Center.jpg',
  },
  'Wells Fargo Center': {
    name: 'Wells Fargo Center',
    city: 'Philadelphia',
    state: 'PA',
    capacity: 20478,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Wells_Fargo_Center.jpg/320px-Wells_Fargo_Center.jpg',
  },
  'State Farm Arena': {
    name: 'State Farm Arena',
    city: 'Atlanta',
    state: 'GA',
    capacity: 18118,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/State_Farm_Arena_2019.jpg/320px-State_Farm_Arena_2019.jpg',
  },
  'Kaseya Center': {
    name: 'Kaseya Center',
    city: 'Miami',
    state: 'FL',
    capacity: 19600,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/American_Airlines_Arena%2C_Miami%2C_FL%2C_jjron_29.03.2012.jpg/320px-American_Airlines_Arena%2C_Miami%2C_FL%2C_jjron_29.03.2012.jpg',
  },
  'Scotiabank Arena': {
    name: 'Scotiabank Arena',
    city: 'Toronto',
    state: 'ON',
    capacity: 19800,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Scotiabank_Arena_-_2018_%28cropped%29.jpg/320px-Scotiabank_Arena_-_2018_%28cropped%29.jpg',
  },
  'Fiserv Forum': {
    name: 'Fiserv Forum',
    city: 'Milwaukee',
    state: 'WI',
    capacity: 17341,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Fiserv_Forum_2019.jpg/320px-Fiserv_Forum_2019.jpg',
  },
  'Target Center': {
    name: 'Target Center',
    city: 'Minneapolis',
    state: 'MN',
    capacity: 18978,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Target_Center_2014.jpg/320px-Target_Center_2014.jpg',
  },
  'Gainbridge Fieldhouse': {
    name: 'Gainbridge Fieldhouse',
    city: 'Indianapolis',
    state: 'IN',
    capacity: 17923,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Bankers_Life_Fieldhouse_%28Gainbridge_Fieldhouse%29.jpg/320px-Bankers_Life_Fieldhouse_%28Gainbridge_Fieldhouse%29.jpg',
  },
  'Little Caesars Arena': {
    name: 'Little Caesars Arena',
    city: 'Detroit',
    state: 'MI',
    capacity: 20332,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Little_Caesars_Arena.jpg/320px-Little_Caesars_Arena.jpg',
  },
  'Spectrum Center': {
    name: 'Spectrum Center',
    city: 'Charlotte',
    state: 'NC',
    capacity: 19077,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Spectrum_Center_2018.jpg/320px-Spectrum_Center_2018.jpg',
  },
  'Capital One Arena': {
    name: 'Capital One Arena',
    city: 'Washington',
    state: 'DC',
    capacity: 20356,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Capital_One_Arena.jpg/320px-Capital_One_Arena.jpg',
  },
  'Rocket Mortgage FieldHouse': {
    name: 'Rocket Mortgage FieldHouse',
    city: 'Cleveland',
    state: 'OH',
    capacity: 19432,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Rocket_Mortgage_FieldHouse_2021.jpg/320px-Rocket_Mortgage_FieldHouse_2021.jpg',
  },
  'Footprint Center': {
    name: 'Footprint Center',
    city: 'Phoenix',
    state: 'AZ',
    capacity: 18055,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Footprint_Center.jpg/320px-Footprint_Center.jpg',
  },
  'Golden 1 Center': {
    name: 'Golden 1 Center',
    city: 'Sacramento',
    state: 'CA',
    capacity: 17608,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Golden_1_Center.jpg/320px-Golden_1_Center.jpg',
  },
  'Smoothie King Center': {
    name: 'Smoothie King Center',
    city: 'New Orleans',
    state: 'LA',
    capacity: 16867,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Smoothie_King_Center.jpg/320px-Smoothie_King_Center.jpg',
  },
  'FedExForum': {
    name: 'FedExForum',
    city: 'Memphis',
    state: 'TN',
    capacity: 17794,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/FedExForum.jpg/320px-FedExForum.jpg',
  },
  'Frost Bank Center': {
    name: 'Frost Bank Center',
    city: 'San Antonio',
    state: 'TX',
    capacity: 18581,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/AT%26T_Center.jpg/320px-AT%26T_Center.jpg',
  },
  'Moda Center': {
    name: 'Moda Center',
    city: 'Portland',
    state: 'OR',
    capacity: 19441,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Moda_Center.jpg/320px-Moda_Center.jpg',
  },
  'Delta Center': {
    name: 'Delta Center',
    city: 'Salt Lake City',
    state: 'UT',
    capacity: 18306,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Vivint_Smart_Home_Arena.jpg/320px-Vivint_Smart_Home_Arena.jpg',
  },
  'Intuit Dome': {
    name: 'Intuit Dome',
    city: 'Inglewood',
    state: 'CA',
    capacity: 18000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Intuit_Dome.jpg/320px-Intuit_Dome.jpg',
  },
  'Amway Center': {
    name: 'Amway Center',
    city: 'Orlando',
    state: 'FL',
    capacity: 18846,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Amway_Center_2012.jpg/320px-Amway_Center_2012.jpg',
  },

  // NFL Stadiums
  'SoFi Stadium': {
    name: 'SoFi Stadium',
    city: 'Inglewood',
    state: 'CA',
    capacity: 70240,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/SoFi_Stadium_2021.jpg/320px-SoFi_Stadium_2021.jpg',
  },
  'Arrowhead Stadium': {
    name: 'Arrowhead Stadium',
    city: 'Kansas City',
    state: 'MO',
    capacity: 76416,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Arrowhead_Stadium_overhead.jpg/320px-Arrowhead_Stadium_overhead.jpg',
  },
  'AT&T Stadium': {
    name: 'AT&T Stadium',
    city: 'Arlington',
    state: 'TX',
    capacity: 80000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/AT%26T_Stadium_Arlington_Texas.jpg/320px-AT%26T_Stadium_Arlington_Texas.jpg',
  },
  'Lambeau Field': {
    name: 'Lambeau Field',
    city: 'Green Bay',
    state: 'WI',
    capacity: 81441,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Lambeau_Field_2018.jpg/320px-Lambeau_Field_2018.jpg',
  },
  'Allegiant Stadium': {
    name: 'Allegiant Stadium',
    city: 'Las Vegas',
    state: 'NV',
    capacity: 65000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Allegiant_Stadium.jpg/320px-Allegiant_Stadium.jpg',
  },
  'Lumen Field': {
    name: 'Lumen Field',
    city: 'Seattle',
    state: 'WA',
    capacity: 68740,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Lumen_Field_2022.jpg/320px-Lumen_Field_2022.jpg',
  },
  'MetLife Stadium': {
    name: 'MetLife Stadium',
    city: 'East Rutherford',
    state: 'NJ',
    capacity: 82500,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MetLife_Stadium.jpg/320px-MetLife_Stadium.jpg',
  },
  'Gillette Stadium': {
    name: 'Gillette Stadium',
    city: 'Foxborough',
    state: 'MA',
    capacity: 65878,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Gillette_Stadium.jpg/320px-Gillette_Stadium.jpg',
  },
  'Empower Field at Mile High': {
    name: 'Empower Field at Mile High',
    city: 'Denver',
    state: 'CO',
    capacity: 76125,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Empower_Field_at_Mile_High.jpg/320px-Empower_Field_at_Mile_High.jpg',
  },
  'Lincoln Financial Field': {
    name: 'Lincoln Financial Field',
    city: 'Philadelphia',
    state: 'PA',
    capacity: 69328,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Lincoln_Financial_Field.jpg/320px-Lincoln_Financial_Field.jpg',
  },
  'M&T Bank Stadium': {
    name: 'M&T Bank Stadium',
    city: 'Baltimore',
    state: 'MD',
    capacity: 71008,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/M%26T_Bank_Stadium.jpg/320px-M%26T_Bank_Stadium.jpg',
  },
  'Highmark Stadium': {
    name: 'Highmark Stadium',
    city: 'Orchard Park',
    state: 'NY',
    capacity: 71608,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Highmark_Stadium_2021.jpg/320px-Highmark_Stadium_2021.jpg',
  },
  'Mercedes-Benz Stadium': {
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    state: 'GA',
    capacity: 71000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Mercedes-Benz_Stadium_2018.jpg/320px-Mercedes-Benz_Stadium_2018.jpg',
  },
  'U.S. Bank Stadium': {
    name: 'U.S. Bank Stadium',
    city: 'Minneapolis',
    state: 'MN',
    capacity: 66655,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/US_Bank_Stadium.jpg/320px-US_Bank_Stadium.jpg',
  },
  'Ford Field': {
    name: 'Ford Field',
    city: 'Detroit',
    state: 'MI',
    capacity: 65000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Ford_Field.jpg/320px-Ford_Field.jpg',
  },
  'Soldier Field': {
    name: 'Soldier Field',
    city: 'Chicago',
    state: 'IL',
    capacity: 61500,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Soldier_Field.jpg/320px-Soldier_Field.jpg',
  },
  'Caesars Superdome': {
    name: 'Caesars Superdome',
    city: 'New Orleans',
    state: 'LA',
    capacity: 73208,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Caesars_Superdome.jpg/320px-Caesars_Superdome.jpg',
  },
  'Raymond James Stadium': {
    name: 'Raymond James Stadium',
    city: 'Tampa',
    state: 'FL',
    capacity: 65890,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Raymond_James_Stadium.jpg/320px-Raymond_James_Stadium.jpg',
  },
  'Hard Rock Stadium': {
    name: 'Hard Rock Stadium',
    city: 'Miami Gardens',
    state: 'FL',
    capacity: 65326,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hard_Rock_Stadium.jpg/320px-Hard_Rock_Stadium.jpg',
  },
  'Acrisure Stadium': {
    name: 'Acrisure Stadium',
    city: 'Pittsburgh',
    state: 'PA',
    capacity: 68400,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Heinz_Field_2015.jpg/320px-Heinz_Field_2015.jpg',
  },
  'NRG Stadium': {
    name: 'NRG Stadium',
    city: 'Houston',
    state: 'TX',
    capacity: 72220,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/NRG_Stadium.jpg/320px-NRG_Stadium.jpg',
  },
  'Nissan Stadium': {
    name: 'Nissan Stadium',
    city: 'Nashville',
    state: 'TN',
    capacity: 69143,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Nissan_Stadium.jpg/320px-Nissan_Stadium.jpg',
  },
  'Lucas Oil Stadium': {
    name: 'Lucas Oil Stadium',
    city: 'Indianapolis',
    state: 'IN',
    capacity: 67000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Lucas_Oil_Stadium.jpg/320px-Lucas_Oil_Stadium.jpg',
  },
  'State Farm Stadium': {
    name: 'State Farm Stadium',
    city: 'Glendale',
    state: 'AZ',
    capacity: 63400,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/State_Farm_Stadium.jpg/320px-State_Farm_Stadium.jpg',
  },
  'Bank of America Stadium': {
    name: 'Bank of America Stadium',
    city: 'Charlotte',
    state: 'NC',
    capacity: 74867,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Bank_of_America_Stadium.jpg/320px-Bank_of_America_Stadium.jpg',
  },
  'Paycor Stadium': {
    name: 'Paycor Stadium',
    city: 'Cincinnati',
    state: 'OH',
    capacity: 65515,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Paul_Brown_Stadium.jpg/320px-Paul_Brown_Stadium.jpg',
  },
  'Cleveland Browns Stadium': {
    name: 'Cleveland Browns Stadium',
    city: 'Cleveland',
    state: 'OH',
    capacity: 67431,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/FirstEnergy_Stadium.jpg/320px-FirstEnergy_Stadium.jpg',
  },
  'EverBank Stadium': {
    name: 'EverBank Stadium',
    city: 'Jacksonville',
    state: 'FL',
    capacity: 69132,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/TIAA_Bank_Field.jpg/320px-TIAA_Bank_Field.jpg',
  },
  'Northwest Stadium': {
    name: 'Northwest Stadium',
    city: 'Landover',
    state: 'MD',
    capacity: 82000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/FedExField.jpg/320px-FedExField.jpg',
  },

  // MLB Stadiums
  'Yankee Stadium': {
    name: 'Yankee Stadium',
    city: 'Bronx',
    state: 'NY',
    capacity: 46537,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Yankee_Stadium_upper_deck_2010.jpg/320px-Yankee_Stadium_upper_deck_2010.jpg',
  },
  'Fenway Park': {
    name: 'Fenway Park',
    city: 'Boston',
    state: 'MA',
    capacity: 37755,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Fenway_Park.jpg/320px-Fenway_Park.jpg',
  },
  'Dodger Stadium': {
    name: 'Dodger Stadium',
    city: 'Los Angeles',
    state: 'CA',
    capacity: 56000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Dodger_Stadium_field_from_upper_deck_2015-10-04.jpg/320px-Dodger_Stadium_field_from_upper_deck_2015-10-04.jpg',
  },
  'Wrigley Field': {
    name: 'Wrigley Field',
    city: 'Chicago',
    state: 'IL',
    capacity: 41649,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Wrigley_Field.jpg/320px-Wrigley_Field.jpg',
  },
  'Oracle Park': {
    name: 'Oracle Park',
    city: 'San Francisco',
    state: 'CA',
    capacity: 41265,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oracle_Park_2019.jpg/320px-Oracle_Park_2019.jpg',
  },
  'Citi Field': {
    name: 'Citi Field',
    city: 'Queens',
    state: 'NY',
    capacity: 41922,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Citi_Field_2019.jpg/320px-Citi_Field_2019.jpg',
  },
  'Globe Life Field': {
    name: 'Globe Life Field',
    city: 'Arlington',
    state: 'TX',
    capacity: 40300,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Globe_Life_Field.jpg/320px-Globe_Life_Field.jpg',
  },
  'Truist Park': {
    name: 'Truist Park',
    city: 'Atlanta',
    state: 'GA',
    capacity: 41084,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Truist_Park.jpg/320px-Truist_Park.jpg',
  },
  'Minute Maid Park': {
    name: 'Minute Maid Park',
    city: 'Houston',
    state: 'TX',
    capacity: 41168,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Minute_Maid_Park.jpg/320px-Minute_Maid_Park.jpg',
  },
  'Petco Park': {
    name: 'Petco Park',
    city: 'San Diego',
    state: 'CA',
    capacity: 40162,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Petco_Park_2019.jpg/320px-Petco_Park_2019.jpg',
  },
  'T-Mobile Park': {
    name: 'T-Mobile Park',
    city: 'Seattle',
    state: 'WA',
    capacity: 47943,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/T-Mobile_Park.jpg/320px-T-Mobile_Park.jpg',
  },
  'Citizens Bank Park': {
    name: 'Citizens Bank Park',
    city: 'Philadelphia',
    state: 'PA',
    capacity: 42792,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Citizens_Bank_Park.jpg/320px-Citizens_Bank_Park.jpg',
  },
  'Progressive Field': {
    name: 'Progressive Field',
    city: 'Cleveland',
    state: 'OH',
    capacity: 34830,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Progressive_Field.jpg/320px-Progressive_Field.jpg',
  },
  'Comerica Park': {
    name: 'Comerica Park',
    city: 'Detroit',
    state: 'MI',
    capacity: 41083,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Comerica_Park.jpg/320px-Comerica_Park.jpg',
  },
  'Target Field': {
    name: 'Target Field',
    city: 'Minneapolis',
    state: 'MN',
    capacity: 38544,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Target_Field_2019.jpg/320px-Target_Field_2019.jpg',
  },
  'Coors Field': {
    name: 'Coors Field',
    city: 'Denver',
    state: 'CO',
    capacity: 50144,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Coors_Field.jpg/320px-Coors_Field.jpg',
  },
  'Busch Stadium': {
    name: 'Busch Stadium',
    city: 'St. Louis',
    state: 'MO',
    capacity: 44383,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Busch_Stadium.jpg/320px-Busch_Stadium.jpg',
  },

  // NHL Arenas (many shared with NBA)
  'Bell Centre': {
    name: 'Bell Centre',
    city: 'Montreal',
    state: 'QC',
    capacity: 21302,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Bell_Centre.jpg/320px-Bell_Centre.jpg',
  },
  'Rogers Arena': {
    name: 'Rogers Arena',
    city: 'Vancouver',
    state: 'BC',
    capacity: 18910,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Rogers_Arena.jpg/320px-Rogers_Arena.jpg',
  },
  'Canadian Tire Centre': {
    name: 'Canadian Tire Centre',
    city: 'Ottawa',
    state: 'ON',
    capacity: 18652,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Canadian_Tire_Centre.jpg/320px-Canadian_Tire_Centre.jpg',
  },
  'Rogers Place': {
    name: 'Rogers Place',
    city: 'Edmonton',
    state: 'AB',
    capacity: 18347,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Rogers_Place.jpg/320px-Rogers_Place.jpg',
  },
  'Scotiabank Saddledome': {
    name: 'Scotiabank Saddledome',
    city: 'Calgary',
    state: 'AB',
    capacity: 19289,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Scotiabank_Saddledome.jpg/320px-Scotiabank_Saddledome.jpg',
  },
  'PPG Paints Arena': {
    name: 'PPG Paints Arena',
    city: 'Pittsburgh',
    state: 'PA',
    capacity: 18387,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/PPG_Paints_Arena.jpg/320px-PPG_Paints_Arena.jpg',
  },
  'Prudential Center': {
    name: 'Prudential Center',
    city: 'Newark',
    state: 'NJ',
    capacity: 16514,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Prudential_Center.jpg/320px-Prudential_Center.jpg',
  },
  'UBS Arena': {
    name: 'UBS Arena',
    city: 'Elmont',
    state: 'NY',
    capacity: 17113,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/UBS_Arena.jpg/320px-UBS_Arena.jpg',
  },
  'Climate Pledge Arena': {
    name: 'Climate Pledge Arena',
    city: 'Seattle',
    state: 'WA',
    capacity: 17100,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Climate_Pledge_Arena.jpg/320px-Climate_Pledge_Arena.jpg',
  },
  'PNC Arena': {
    name: 'PNC Arena',
    city: 'Raleigh',
    state: 'NC',
    capacity: 18680,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PNC_Arena.jpg/320px-PNC_Arena.jpg',
  },
  'Amerant Bank Arena': {
    name: 'Amerant Bank Arena',
    city: 'Sunrise',
    state: 'FL',
    capacity: 19250,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/BB%26T_Center.jpg/320px-BB%26T_Center.jpg',
  },
  'Amalie Arena': {
    name: 'Amalie Arena',
    city: 'Tampa',
    state: 'FL',
    capacity: 19092,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Amalie_Arena.jpg/320px-Amalie_Arena.jpg',
  },
  'Bridgestone Arena': {
    name: 'Bridgestone Arena',
    city: 'Nashville',
    state: 'TN',
    capacity: 17159,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bridgestone_Arena.jpg/320px-Bridgestone_Arena.jpg',
  },
  'Enterprise Center': {
    name: 'Enterprise Center',
    city: 'St. Louis',
    state: 'MO',
    capacity: 18096,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Enterprise_Center.jpg/320px-Enterprise_Center.jpg',
  },
  'Xcel Energy Center': {
    name: 'Xcel Energy Center',
    city: 'St. Paul',
    state: 'MN',
    capacity: 17954,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Xcel_Energy_Center.jpg/320px-Xcel_Energy_Center.jpg',
  },
  'Nationwide Arena': {
    name: 'Nationwide Arena',
    city: 'Columbus',
    state: 'OH',
    capacity: 18144,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Nationwide_Arena.jpg/320px-Nationwide_Arena.jpg',
  },
  'KeyBank Center': {
    name: 'KeyBank Center',
    city: 'Buffalo',
    state: 'NY',
    capacity: 19070,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/KeyBank_Center.jpg/320px-KeyBank_Center.jpg',
  },
  'Honda Center': {
    name: 'Honda Center',
    city: 'Anaheim',
    state: 'CA',
    capacity: 17174,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Honda_Center.jpg/320px-Honda_Center.jpg',
  },
  'SAP Center': {
    name: 'SAP Center',
    city: 'San Jose',
    state: 'CA',
    capacity: 17562,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/SAP_Center.jpg/320px-SAP_Center.jpg',
  },
  'Canada Life Centre': {
    name: 'Canada Life Centre',
    city: 'Winnipeg',
    state: 'MB',
    capacity: 15321,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Canada_Life_Centre.jpg/320px-Canada_Life_Centre.jpg',
  },

  // Soccer Stadiums (MLS)
  'Inter&Co Stadium': {
    name: 'Inter&Co Stadium',
    city: 'Orlando',
    state: 'FL',
    capacity: 25500,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Orlando_City_Stadium.jpg/320px-Orlando_City_Stadium.jpg',
  },
  'Lower.com Field': {
    name: 'Lower.com Field',
    city: 'Columbus',
    state: 'OH',
    capacity: 20371,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Lower.com_Field.jpg/320px-Lower.com_Field.jpg',
  },
  'Audi Field': {
    name: 'Audi Field',
    city: 'Washington',
    state: 'DC',
    capacity: 20000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Audi_Field.jpg/320px-Audi_Field.jpg',
  },
  'Dignity Health Sports Park': {
    name: 'Dignity Health Sports Park',
    city: 'Carson',
    state: 'CA',
    capacity: 27000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Dignity_Health_Sports_Park.jpg/320px-Dignity_Health_Sports_Park.jpg',
  },
  'Q2 Stadium': {
    name: 'Q2 Stadium',
    city: 'Austin',
    state: 'TX',
    capacity: 20738,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Q2_Stadium.jpg/320px-Q2_Stadium.jpg',
  },
  'BMO Stadium': {
    name: 'BMO Stadium',
    city: 'Los Angeles',
    state: 'CA',
    capacity: 22000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Banc_of_California_Stadium.jpg/320px-Banc_of_California_Stadium.jpg',
  },
  'Red Bull Arena': {
    name: 'Red Bull Arena',
    city: 'Harrison',
    state: 'NJ',
    capacity: 25000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Red_Bull_Arena.jpg/320px-Red_Bull_Arena.jpg',
  },
  'Providence Park': {
    name: 'Providence Park',
    city: 'Portland',
    state: 'OR',
    capacity: 25218,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Providence_Park.jpg/320px-Providence_Park.jpg',
  },
  'Subaru Park': {
    name: 'Subaru Park',
    city: 'Chester',
    state: 'PA',
    capacity: 18500,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Subaru_Park.jpg/320px-Subaru_Park.jpg',
  },
  'Children\'s Mercy Park': {
    name: 'Children\'s Mercy Park',
    city: 'Kansas City',
    state: 'KS',
    capacity: 18467,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Children%27s_Mercy_Park.jpg/320px-Children%27s_Mercy_Park.jpg',
  },
  'Allianz Field': {
    name: 'Allianz Field',
    city: 'St. Paul',
    state: 'MN',
    capacity: 19400,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Allianz_Field.jpg/320px-Allianz_Field.jpg',
  },
  'TQL Stadium': {
    name: 'TQL Stadium',
    city: 'Cincinnati',
    state: 'OH',
    capacity: 26000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/TQL_Stadium.jpg/320px-TQL_Stadium.jpg',
  },
  'Chase Stadium': {
    name: 'Chase Stadium',
    city: 'Fort Lauderdale',
    state: 'FL',
    capacity: 21550,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/DRV_PNK_Stadium.jpg/320px-DRV_PNK_Stadium.jpg',
  },
  'PayPal Park': {
    name: 'PayPal Park',
    city: 'San Jose',
    state: 'CA',
    capacity: 18000,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/PayPal_Park.jpg/320px-PayPal_Park.jpg',
  },
};

/**
 * Get venue info by name with fuzzy matching
 */
export function getVenueInfo(venueName: string): VenueInfo | null {
  // Direct match
  if (VENUE_DATA[venueName]) {
    return VENUE_DATA[venueName];
  }

  // Try partial matching (venue names can vary)
  const lowerName = venueName.toLowerCase();
  for (const [key, value] of Object.entries(VENUE_DATA)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Try matching by city
  for (const venue of Object.values(VENUE_DATA)) {
    if (venue.city && lowerName.includes(venue.city.toLowerCase())) {
      return venue;
    }
  }

  return null;
}

/**
 * Generate Google Maps search URL for a venue
 */
export function getGoogleMapsUrl(venue: VenueInfo | string): string {
  if (typeof venue === 'string') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
  }

  const searchQuery = venue.city && venue.state
    ? `${venue.name}, ${venue.city}, ${venue.state}`
    : venue.name;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
}

/**
 * Get default icon for sport when no venue image available
 */
export function getSportIcon(sport: Sport): string {
  const icons: Record<Sport, string> = {
    nfl: '🏈',
    nba: '🏀',
    mlb: '⚾',
    nhl: '🏒',
    soccer: '⚽',
  };
  return icons[sport];
}
