// ═══════════════════════════════════════════════
//  DATA — all shared constants and mock data
// ═══════════════════════════════════════════════

export const showToast = (msg) => {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
};

export const GUIDES = [
  { id:1, name:"Arjun Sharma", city:"Old Delhi", type:"Heritage", rate:1800, rating:4.9, trips:200, tags:["Heritage","History"], img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70", verified:true },
  { id:2, name:"Meera Devi", city:"Varanasi", type:"Spiritual", rate:1500, rating:5.0, trips:310, tags:["Spiritual","Ghats"], img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=70", verified:true },
  { id:3, name:"Rahul Nair", city:"Manali", type:"Trekking", rate:2200, rating:4.8, trips:145, tags:["Trekking","Adventure"], img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=70", verified:true },
  { id:4, name:"Priya Menon", city:"Kochi", type:"Food", rate:1200, rating:4.7, trips:98, tags:["Food","Culture"], img:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=70", verified:true },
  { id:5, name:"Vikram Singh", city:"Jaipur", type:"Heritage", rate:1600, rating:4.9, trips:230, tags:["Heritage","Forts"], img:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=70", verified:true },
  { id:6, name:"Ananya Das", city:"Darjeeling", type:"Nature", rate:1400, rating:4.8, trips:112, tags:["Nature","Tea Garden"], img:"https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&q=70", verified:true },
];

export const TRIPS = [
  { id:1, title:"Banaras Spiritual Tour", location:"📍 UP, India", date:"📅 20th March", desc:"Looking for 2 people to join for morning Aarti and street food tour.", img:"https://images.unsplash.com/photo-1561361058-c24e022e2a8d?w=600&q=70" },
  { id:2, title:"Manali Trekking Buddy", location:"📍 Himachal, India", date:"📅 15th April", desc:"Planning Solang Valley. Budget-friendly. Solo travelers welcome!", img:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=70" },
  { id:3, title:"Darjeeling Tea Garden", location:"📍 West Bengal", date:"📅 5th May", desc:"Looking for someone to explore tea gardens and authentic local cuisine.", img:"https://images.unsplash.com/photo-1623676631479-3f1862f86ff6?w=600&q=70" },
];

export const FOODS = [
  { name:"Kachori-Sabzi", city:"Varanasi", emoji:"🥟", desc:"Crispy stuffed kachoris in spicy sabzi — the quintessential UP breakfast.", price:"₹40–₹80", spice:"🌶🌶🌶", img:"https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&q=70", cat:"Street Food" },
  { name:"Biryani", city:"Lucknow", emoji:"🍚", desc:"Awadhi dum biryani — slow-cooked perfection with saffron and whole spices.", price:"₹120–₹350", spice:"🌶🌶", img:"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=70", cat:"Rice" },
  { name:"Dal Baati Churma", city:"Jaipur", emoji:"🫙", desc:"Rajasthan's pride — hard wheat rolls with lentils and sweet churma.", price:"₹100–₹200", spice:"🌶", img:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=70", cat:"Thali" },
  { name:"Masala Chai", city:"All India", emoji:"☕", desc:"India's soul in a cup — ginger, cardamom, cloves, and bold tea leaves.", price:"₹10–₹30", spice:"🌶", img:"https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=500&q=70", cat:"Drinks" },
  { name:"Pav Bhaji", city:"Mumbai", emoji:"🥘", desc:"Butter-loaded vegetable mash with soft Mumbai pav — street royalty.", price:"₹60–₹150", spice:"🌶🌶", img:"https://images.unsplash.com/photo-1606756790138-261d2b21cd77?w=500&q=70", cat:"Street Food" },
  { name:"Dosa", city:"Chennai", emoji:"🥞", desc:"Paper-thin golden dosa with sambar and three chutneys. Pure south India.", price:"₹50–₹120", spice:"🌶🌶", img:"https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=70", cat:"South Indian" },
];

export const STAYS_DATA = [
  { id:1, name:"Haveli Wadi", city:"Jaipur", area:"Bani Park", host:"Meena Sharma", hostInitials:"MS", img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=70", rating:4.9, reviews:145, quickPrice:500, overnightPrice:1800, amenities:["📶 WiFi","❄️ AC","🍛 Home Food","🧺 Laundry"], type:"homestay" },
  { id:2, name:"Ganga View Homestay", city:"Varanasi", area:"Dashashwamedh", host:"Mohan Lal", hostInitials:"ML", img:"https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=70", rating:4.8, reviews:98, quickPrice:280, overnightPrice:1100, amenities:["📶 WiFi","🛕 Ganga View","🍛 Chai & Breakfast","🚿 Geyser"], type:"quick" },
  { id:3, name:"Alpine Retreat", city:"Manali", area:"Naggar", host:"Ravi Thakur", hostInitials:"RT", img:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=70", rating:4.7, reviews:62, quickPrice:600, overnightPrice:2200, amenities:["🏔️ Valley View","🍛 Home Food","🚿 Geyser","🌲 Nature Walk"], type:"homestay" },
  { id:4, name:"Backpacker's Hub", city:"Delhi", area:"Paharganj", host:"Rajiv Gupta", hostInitials:"RG", img:"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=70", rating:4.5, reviews:210, quickPrice:200, overnightPrice:700, amenities:["📶 WiFi","🛏️ Dorm Beds","🧳 Locker","🗺️ Travel Desk"], type:"overnight" },
  { id:5, name:"Tea Garden Cottage", city:"Darjeeling", area:"Happy Valley", host:"Anita Das", hostInitials:"AD", img:"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&q=70", rating:4.8, reviews:55, quickPrice:450, overnightPrice:1600, amenities:["🍵 Tea Tours","🏔️ Himalaya View","🌲 Garden Walk","🍛 Breakfast"], type:"homestay" },
  { id:6, name:"Beachside Casa", city:"Goa", area:"Anjuna", host:"Maria Fernandes", hostInitials:"MF", img:"https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=70", rating:4.6, reviews:91, quickPrice:450, overnightPrice:1800, amenities:["📶 WiFi","🏖️ Beach Walk","🍛 Breakfast","❄️ AC"], type:"overnight" },
];

export const TRANSPORT_DATA = {
  train:[
    { id:"t1", opIcon:"🚂", operator:"Rajdhani Express", number:"12301", type:"Premium AC", from:"New Delhi", fromCode:"NDLS", to:"Varanasi", toCode:"BSB", dep:"06:00", arr:"14:25", duration:"8h 25m", stops:"Non-Stop", price:1450, avail:"avail", availText:"Seats Available", sponsored:false, details:["💺 Air-conditioned sleeper with meals","📶 WiFi available on train","🚿 Clean toilets & pantry car"] },
    { id:"t2", opIcon:"🚂", operator:"Shatabdi Express", number:"12015", type:"Chair Car", from:"Delhi", fromCode:"NDLS", to:"Jaipur", toCode:"JP", dep:"06:05", arr:"10:40", duration:"4h 35m", stops:"Non-Stop", price:750, avail:"avail", availText:"Seats Available", sponsored:false, details:["🍽️ Breakfast served on train","💺 Fully air-conditioned","⚡ Fast & reliable schedule"] },
    { id:"t3", opIcon:"🚂", operator:"Humsafar Express", number:"12595", type:"3rd AC", from:"Mumbai", fromCode:"CSMT", to:"Goa", toCode:"MAO", dep:"22:00", arr:"08:30", duration:"10h 30m", stops:"2 Stops", price:890, avail:"limited", availText:"6 Seats Left", sponsored:true, details:["🌙 Comfortable overnight journey","💺 3-tier AC sleeper","☕ Pantry car available"] },
  ],
  bus:[
    { id:"b1", opIcon:"🚌", operator:"Volvo AC Sleeper", number:"VB-2341", type:"AC Semi-Sleeper", from:"Delhi", fromCode:"ISBT", to:"Manali", toCode:"Old Bus Stand", dep:"17:30", arr:"09:00", duration:"15h 30m", stops:"1 Stop", price:1100, avail:"avail", availText:"Seats Available", sponsored:false, details:["🎬 Entertainment screens","❄️ Full AC with blankets","🅿️ Pickup from ISBT Kashmiri Gate"] },
    { id:"b2", opIcon:"🚌", operator:"KSRTC Airavat", number:"KA-5872", type:"AC Sleeper", from:"Bangalore", fromCode:"Majestic", to:"Goa", toCode:"Panaji", dep:"21:00", arr:"07:30", duration:"10h 30m", stops:"Non-Stop", price:900, avail:"avail", availText:"Seats Available", sponsored:false, details:["😴 Push-back sleeper seats","👶 Ladies seat allocation","🎵 Entertainment system"] },
  ],
  flight:[
    { id:"f1", opIcon:"✈️", operator:"IndiGo", number:"6E-2341", type:"Economy · Non-Stop", from:"New Delhi", fromCode:"DEL", to:"Mumbai", toCode:"BOM", dep:"07:00", arr:"09:15", duration:"2h 15m", stops:"Non-Stop", price:4299, avail:"avail", availText:"Seats Available", sponsored:false, details:["💼 7kg cabin baggage included","🍱 Paid meal options available","🌐 Unmatched on-time performance"] },
    { id:"f2", opIcon:"✈️", operator:"Air India", number:"AI-663", type:"Economy · Non-Stop", from:"Delhi", fromCode:"DEL", to:"Goa", toCode:"GOI", dep:"09:30", arr:"12:00", duration:"2h 30m", stops:"Non-Stop", price:5800, avail:"limited", availText:"4 Seats Left", sponsored:false, details:["💼 15kg check-in included","🍽️ Full complimentary meal","🎬 In-flight entertainment"] },
  ]
};

export const BOT_RESPONSES = {
  "guide kaise dhundhu?":"Find a Guide page pe jaao — wahan 500+ verified guides hain! City ya expertise se filter kar sakte ho 🗺️",
  "local food?":"Local Food section mein best hidden gems milenge! Varanasi ki kachori, Lucknow ki biryani — sab kuch hai 🍛",
  "guide banna chahta hun":"Bahut achha! Become a Guide page pe form bharo. Sirf 15+ age chahiye! Avg ₹45k/month earn karo 🏆",
  "trip plan karna hai":"Create a Trip page pe destination enter karo aur travel buddies se connect karo. Akele mat jao! 🎒",
  "pricing kya hai?":"Guides ka rate ₹500 se ₹3,000 per day hai — expertise aur city ke hisaab se 💰",
  "stay tips?":"Chale Buddy pe 2,400+ verified stays hain — quick fresh-up se full homestay tak! Rating dekh ke book karo 🏠",
  "ticket price?":"Train mein ₹500 se shuru, Bus ₹400 se, Flight ₹2,000 se — sab ek jagah mile! 🚂✈️",
  "route suggest karo":"Popular routes: Delhi→Varanasi (train, 8hrs), Mumbai→Goa (bus/flight), Delhi→Manali (bus overnight) 🗺️",
  default:"Namaste! 🙏 Main Buddy Bot hun. Puchh sakte ho: trip planning, guide dhundna, local food, stays, transport ke baare mein!"
};
