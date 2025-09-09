import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Mock data for development
const mockProperties = [
  {
    "id": 1,
    "title": "Detached house in Rumuokoro, Port Harcourt",
    "price": 22000000,
    "currency": "₦",
    "location": "Rumuokoro, Port Harcourt",
    "city": "Port Harcourt",
    "area": 100,
    "bedrooms": 3,
    "bathrooms": 2,
    "type": "detached house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/detached-house-1.jpg",
      "/detached-house-2.jpg",
      "/detached-house-3.jpg",
      "/detached-house-4.jpg"
    ],
    "description": "Standalone house with private compound located in the prestigious Rumuokoro area of Port Harcourt. \n    This detached house features 3 bedrooms and \n    2 bathrooms with approximately 100 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Sauna",
      "Squash Court",
      "Water Treatment"
    ],
    "coordinates": {
      "lat": 8.031899692673301,
      "lng": 7.825620320327421
    },
    "listedDate": "2025-02-01T15:38:29.468Z",
    "featured": false
  },
  {
    "id": 2,
    "title": "Resort in Lekki Phase 1, Lagos",
    "price": 2200000,
    "currency": "₦",
    "location": "Lekki Phase 1, Lagos",
    "city": "Lagos",
    "area": 800,
    "bedrooms": 5,
    "bathrooms": 5,
    "type": "resort",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/resort-1.jpg"
    ],
    "description": "Luxury vacation property located in the prestigious Lekki Phase 1 area of Lagos. \n    This resort features 5 bedrooms and \n    5 bathrooms with approximately 800 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Gym",
      "Concierge",
      "Swimming Pool",
      "Cinema",
      "Spa",
      "24/7 Security",
      "Air Conditioning",
      "Laundry",
      "Jacuzzi"
    ],
    "coordinates": {
      "lat": 8.185590412779051,
      "lng": 3.559845187582167
    },
    "listedDate": "2025-04-22T02:31:31.866Z",
    "featured": false
  },
  {
    "id": 3,
    "title": "Terrace house in Ajah, Lagos",
    "price": 11000000,
    "currency": "₦",
    "location": "Ajah, Lagos",
    "city": "Lagos",
    "area": 220,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "terrace house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/terrace-house-1.jpg",
      "/terrace-house-2.jpg",
      "/terrace-house-3.jpg"
    ],
    "description": "Row of identical houses sharing side walls located in the prestigious Ajah area of Lagos. \n    This terrace house features 2 bedrooms and \n    2 bathrooms with approximately 220 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Swimming Pool"
    ],
    "coordinates": {
      "lat": 5.047444111430028,
      "lng": 4.969130813791345
    },
    "listedDate": "2025-01-13T23:46:20.275Z",
    "featured": false
  },
  {
    "id": 4,
    "title": "Townhouse in Lugbe, Abuja",
    "price": 21000000,
    "currency": "₦",
    "location": "Lugbe, Abuja",
    "city": "Abuja",
    "area": 150,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "townhouse",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg",
      "/townhouse-3.jpg",
      "/townhouse-4.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Lugbe area of Abuja. \n    This townhouse features 3 bedrooms and \n    3 bathrooms with approximately 150 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Spa",
      "Swimming Pool",
      "24/7 Security"
    ],
    "coordinates": {
      "lat": 5.597779055121747,
      "lng": 4.224222275944547
    },
    "listedDate": "2025-04-06T20:42:42.709Z",
    "featured": false
  },
  {
    "id": 5,
    "title": "Resort in Asokoro, Abuja",
    "price": 45000000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 1450,
    "bedrooms": 7,
    "bathrooms": 6,
    "type": "resort",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/resort-1.jpg",
      "/resort-2.jpg"
    ],
    "description": "Luxury vacation property located in the prestigious Asokoro area of Abuja. \n    This resort features 7 bedrooms and \n    6 bathrooms with approximately 1450 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Gym",
      "Swimming Pool",
      "Smart Home",
      "Laundry",
      "Helipad"
    ],
    "coordinates": {
      "lat": 6.4568512655365495,
      "lng": 5.169267519351321
    },
    "listedDate": "2024-12-21T09:08:55.550Z",
    "featured": false
  },
  {
    "id": 6,
    "title": "Retail space in Ajah, Lagos",
    "price": 1100000,
    "currency": "₦",
    "location": "Ajah, Lagos",
    "city": "Lagos",
    "area": 975,
    "bedrooms": 0,
    "bathrooms": 3,
    "type": "retail space",
    "category": "commercial",
    "status": "for-rent",
    "images": [
      "/retail-space-1.jpg",
      "/retail-space-2.jpg",
      "/retail-space-3.jpg"
    ],
    "description": "Property for retail business located in the prestigious Ajah area of Lagos. \n    This retail space features 0 bedrooms and \n    3 bathrooms with approximately 975 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Balcony"
    ],
    "coordinates": {
      "lat": 5.455763636787186,
      "lng": 6.530523490075564
    },
    "listedDate": "2025-07-06T03:05:07.824Z",
    "featured": false
  },
  {
    "id": 7,
    "title": "Studio apartment in Ogbunabali, Port Harcourt",
    "price": 20000000,
    "currency": "₦",
    "location": "Ogbunabali, Port Harcourt",
    "city": "Port Harcourt",
    "area": 230,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "studio apartment",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/studio-apartment-1.jpg",
      "/studio-apartment-2.jpg",
      "/studio-apartment-3.jpg"
    ],
    "description": "Compact living space perfect for singles located in the prestigious Ogbunabali area of Port Harcourt. \n    This studio apartment features 4 bedrooms and \n    3 bathrooms with approximately 230 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Generator",
      "Water Treatment",
      "Elevator",
      "CCTV"
    ],
    "coordinates": {
      "lat": 8.457889588469886,
      "lng": 7.438005180641136
    },
    "listedDate": "2025-03-08T22:01:07.513Z",
    "featured": true
  },
  {
    "id": 8,
    "title": "Studio apartment in Mile 1, Port Harcourt",
    "price": 1000000,
    "currency": "₦",
    "location": "Mile 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 80,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "studio apartment",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/studio-apartment-1.jpg"
    ],
    "description": "Compact living space perfect for singles located in the prestigious Mile 1 area of Port Harcourt. \n    This studio apartment features 2 bedrooms and \n    1 bathroom with approximately 80 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Parking",
      "Generator",
      "Water Treatment",
      "Borehole",
      "Basketball Court"
    ],
    "coordinates": {
      "lat": 7.62793693520998,
      "lng": 5.464770160065521
    },
    "listedDate": "2025-03-17T06:35:43.027Z",
    "featured": false
  },
  {
    "id": 9,
    "title": "Villa in Asokoro, Abuja",
    "price": 48000000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 800,
    "bedrooms": 3,
    "bathrooms": 2,
    "type": "villa",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/villa-1.jpg",
      "/villa-2.jpg",
      "/villa-3.jpg",
      "/villa-4.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious Asokoro area of Abuja. \n    This villa features 3 bedrooms and \n    2 bathrooms with approximately 800 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Concierge",
      "24/7 Security",
      "Cinema",
      "Helipad",
      "CCTV",
      "Basketball Court"
    ],
    "coordinates": {
      "lat": 5.200948763697786,
      "lng": 8.246321302492055
    },
    "listedDate": "2025-08-24T23:18:35.683Z",
    "featured": false
  },
  {
    "id": 10,
    "title": "Retail space in Ajah, Lagos",
    "price": 800000,
    "currency": "₦",
    "location": "Ajah, Lagos",
    "city": "Lagos",
    "area": 800,
    "bedrooms": 0,
    "bathrooms": 1,
    "type": "retail space",
    "category": "commercial",
    "status": "for-rent",
    "images": [
      "/retail-space-1.jpg",
      "/retail-space-2.jpg",
      "/retail-space-3.jpg"
    ],
    "description": "Property for retail business located in the prestigious Ajah area of Lagos. \n    This retail space features 0 bedrooms and \n    1 bathroom with approximately 800 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Gated Community",
      "Conference Room"
    ],
    "coordinates": {
      "lat": 5.717268955327707,
      "lng": 4.752851041968441
    },
    "listedDate": "2024-11-20T09:52:35.481Z",
    "featured": true
  },
  {
    "id": 11,
    "title": "Luxury apartment in Victoria Island, Lagos",
    "price": 55000000,
    "currency": "₦",
    "location": "Victoria Island, Lagos",
    "city": "Lagos",
    "area": 1450,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "luxury apartment",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/luxury-apartment-1.jpg",
      "/luxury-apartment-2.jpg",
      "/luxury-apartment-3.jpg"
    ],
    "description": "High-end apartment with premium features located in the prestigious Victoria Island area of Lagos. \n    This luxury apartment features 2 bedrooms and \n    2 bathrooms with approximately 1450 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Concierge",
      "Cinema",
      "24/7 Security",
      "Swimming Pool",
      "Gym",
      "Smart Home",
      "Business Center"
    ],
    "coordinates": {
      "lat": 4.610593950729631,
      "lng": 6.658193766272953
    },
    "listedDate": "2025-07-17T10:37:56.179Z",
    "featured": true
  },
  {
    "id": 12,
    "title": "Townhouse in Wuse 2, Abuja",
    "price": 450000,
    "currency": "₦",
    "location": "Wuse 2, Abuja",
    "city": "Abuja",
    "area": 90,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "townhouse",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/townhouse-1.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Wuse 2 area of Abuja. \n    This townhouse features 2 bedrooms and \n    1 bathroom with approximately 90 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Children's Play Area",
      "Garden"
    ],
    "coordinates": {
      "lat": 5.767200218840679,
      "lng": 7.200372722448951
    },
    "listedDate": "2025-04-02T07:08:06.937Z",
    "featured": false
  },
  {
    "id": 13,
    "title": "Townhouse in Mile 1, Port Harcourt",
    "price": 450000,
    "currency": "₦",
    "location": "Mile 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 110,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "townhouse",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Mile 1 area of Port Harcourt. \n    This townhouse features 2 bedrooms and \n    2 bathrooms with approximately 110 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Concierge",
      "Elevator"
    ],
    "coordinates": {
      "lat": 6.061853582718419,
      "lng": 5.19214136963229
    },
    "listedDate": "2025-05-16T06:19:11.579Z",
    "featured": false
  },
  {
    "id": 14,
    "title": "Duplex in Yaba, Lagos",
    "price": 22000000,
    "currency": "₦",
    "location": "Yaba, Lagos",
    "city": "Lagos",
    "area": 50,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "duplex",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/duplex-1.jpg",
      "/duplex-2.jpg",
      "/duplex-3.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Yaba area of Lagos. \n    This duplex features 2 bedrooms and \n    1 bathroom with approximately 50 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Elevator",
      "Playground"
    ],
    "coordinates": {
      "lat": 7.51261099031203,
      "lng": 4.908507100078839
    },
    "listedDate": "2025-05-24T10:47:42.722Z",
    "featured": false
  },
  {
    "id": 15,
    "title": "Townhouse in Ajah, Lagos",
    "price": 300000,
    "currency": "₦",
    "location": "Ajah, Lagos",
    "city": "Lagos",
    "area": 140,
    "bedrooms": 4,
    "bathrooms": 4,
    "type": "townhouse",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg",
      "/townhouse-3.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Ajah area of Lagos. \n    This townhouse features 4 bedrooms and \n    4 bathrooms with approximately 140 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Business Center",
      "Club House"
    ],
    "coordinates": {
      "lat": 6.770496762799764,
      "lng": 3.657630945695
    },
    "listedDate": "2025-06-14T02:18:37.185Z",
    "featured": true
  },
  {
    "id": 16,
    "title": "Guest house in Abuloma, Port Harcourt",
    "price": 900000,
    "currency": "₦",
    "location": "Abuloma, Port Harcourt",
    "city": "Port Harcourt",
    "area": 110,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "guest house",
    "category": "hospitality",
    "status": "for-rent",
    "images": [
      "/guest-house-1.jpg",
      "/guest-house-2.jpg",
      "/guest-house-3.jpg"
    ],
    "description": "Small lodging establishment located in the prestigious Abuloma area of Port Harcourt. \n    This guest house features 2 bedrooms and \n    1 bathroom with approximately 110 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "BBQ Area",
      "CCTV",
      "Playground"
    ],
    "coordinates": {
      "lat": 5.48360240718281,
      "lng": 5.785256084250711
    },
    "listedDate": "2025-01-30T03:23:00.811Z",
    "featured": false
  },
  {
    "id": 17,
    "title": "Villa in Asokoro, Abuja",
    "price": 18000000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 1250,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "villa",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/villa-1.jpg",
      "/villa-2.jpg",
      "/villa-3.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious Asokoro area of Abuja. \n    This villa features 2 bedrooms and \n    1 bathroom with approximately 1250 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Gym",
      "24/7 Security",
      "Spa",
      "Children's Play Area",
      "Basketball Court"
    ],
    "coordinates": {
      "lat": 6.736857402235751,
      "lng": 7.481004079883239
    },
    "listedDate": "2025-09-05T21:13:00.550Z",
    "featured": false
  },
  {
    "id": 18,
    "title": "Townhouse in Omole, Lagos",
    "price": 100000,
    "currency": "₦",
    "location": "Omole, Lagos",
    "city": "Lagos",
    "area": 240,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "townhouse",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg",
      "/townhouse-3.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Omole area of Lagos. \n    This townhouse features 4 bedrooms and \n    3 bathrooms with approximately 240 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Parking",
      "CCTV"
    ],
    "coordinates": {
      "lat": 6.006872431502601,
      "lng": 4.778661714639496
    },
    "listedDate": "2025-01-14T15:37:48.717Z",
    "featured": true
  },
  {
    "id": 19,
    "title": "Villa in Asokoro, Abuja",
    "price": 50000000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 1450,
    "bedrooms": 7,
    "bathrooms": 7,
    "type": "villa",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/villa-1.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious Asokoro area of Abuja. \n    This villa features 7 bedrooms and \n    7 bathrooms with approximately 1450 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Concierge",
      "24/7 Security",
      "Swimming Pool",
      "Air Conditioning",
      "Children's Play Area"
    ],
    "coordinates": {
      "lat": 4.555696925371291,
      "lng": 4.101560309580124
    },
    "listedDate": "2024-10-19T15:03:09.304Z",
    "featured": false
  },
  {
    "id": 20,
    "title": "Resort in Lekki Phase 1, Lagos",
    "price": 55000000,
    "currency": "₦",
    "location": "Lekki Phase 1, Lagos",
    "city": "Lagos",
    "area": 1250,
    "bedrooms": 7,
    "bathrooms": 7,
    "type": "resort",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/resort-1.jpg",
      "/resort-2.jpg",
      "/resort-3.jpg"
    ],
    "description": "Luxury vacation property located in the prestigious Lekki Phase 1 area of Lagos. \n    This resort features 7 bedrooms and \n    7 bathrooms with approximately 1250 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Gym",
      "Spa",
      "Concierge",
      "Helipad"
    ],
    "coordinates": {
      "lat": 5.124363423216548,
      "lng": 4.478598157467552
    },
    "listedDate": "2024-10-31T00:03:13.931Z",
    "featured": false
  },
  {
    "id": 21,
    "title": "Detached house in Ogudu, Lagos",
    "price": 31000000,
    "currency": "₦",
    "location": "Ogudu, Lagos",
    "city": "Lagos",
    "area": 120,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "detached house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/detached-house-1.jpg",
      "/detached-house-2.jpg",
      "/detached-house-3.jpg"
    ],
    "description": "Standalone house with private compound located in the prestigious Ogudu area of Lagos. \n    This detached house features 2 bedrooms and \n    2 bathrooms with approximately 120 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "CCTV"
    ],
    "coordinates": {
      "lat": 5.141687778921554,
      "lng": 5.517540017008271
    },
    "listedDate": "2024-12-29T16:03:45.553Z",
    "featured": true
  },
  {
    "id": 22,
    "title": "Villa in Asokoro, Abuja",
    "price": 40000000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 1600,
    "bedrooms": 5,
    "bathrooms": 4,
    "type": "villa",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/villa-1.jpg",
      "/villa-2.jpg",
      "/villa-3.jpg",
      "/villa-4.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious Asokoro area of Abuja. \n    This villa features 5 bedrooms and \n    4 bathrooms with approximately 1600 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Cinema",
      "Swimming Pool",
      "24/7 Security",
      "Spa",
      "Concierge",
      "Air Conditioning",
      "Club House"
    ],
    "coordinates": {
      "lat": 4.624013507976495,
      "lng": 3.8637603018272353
    },
    "listedDate": "2025-05-25T09:02:04.551Z",
    "featured": false
  },
  {
    "id": 23,
    "title": "Semi-detached house in Kubwa, Abuja",
    "price": 500000,
    "currency": "₦",
    "location": "Kubwa, Abuja",
    "city": "Abuja",
    "area": 80,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "semi-detached house",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/semi-detached-house-1.jpg"
    ],
    "description": "House sharing one common wall located in the prestigious Kubwa area of Abuja. \n    This semi-detached house features 1 bedroom and \n    1 bathroom with approximately 80 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Children's Play Area",
      "Basketball Court",
      "Generator"
    ],
    "coordinates": {
      "lat": 6.683123427358326,
      "lng": 7.594555988883663
    },
    "listedDate": "2025-08-15T01:03:11.860Z",
    "featured": false
  },
  {
    "id": 24,
    "title": "Detached house in Surulere, Lagos",
    "price": 350000,
    "currency": "₦",
    "location": "Surulere, Lagos",
    "city": "Lagos",
    "area": 150,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "detached house",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/detached-house-1.jpg",
      "/detached-house-2.jpg"
    ],
    "description": "Standalone house with private compound located in the prestigious Surulere area of Lagos. \n    This detached house features 3 bedrooms and \n    3 bathrooms with approximately 150 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Swimming Pool",
      "Tennis Court",
      "Gated Community"
    ],
    "coordinates": {
      "lat": 8.361152576064136,
      "lng": 6.51645981287042
    },
    "listedDate": "2025-07-06T09:29:36.193Z",
    "featured": false
  },
  {
    "id": 25,
    "title": "Detached house in Ikeja, Lagos",
    "price": 18000000,
    "currency": "₦",
    "location": "Ikeja, Lagos",
    "city": "Lagos",
    "area": 130,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "detached house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/detached-house-1.jpg"
    ],
    "description": "Standalone house with private compound located in the prestigious Ikeja area of Lagos. \n    This detached house features 2 bedrooms and \n    2 bathrooms with approximately 130 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Playground",
      "BBQ Area",
      "Parking"
    ],
    "coordinates": {
      "lat": 7.804417108043871,
      "lng": 7.284854291644351
    },
    "listedDate": "2025-05-12T05:34:49.860Z",
    "featured": false
  },
  {
    "id": 26,
    "title": "Terrace house in Mile 1, Port Harcourt",
    "price": 300000,
    "currency": "₦",
    "location": "Mile 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 150,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "terrace house",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/terrace-house-1.jpg",
      "/terrace-house-2.jpg"
    ],
    "description": "Row of identical houses sharing side walls located in the prestigious Mile 1 area of Port Harcourt. \n    This terrace house features 1 bedroom and \n    1 bathroom with approximately 150 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Water Treatment",
      "Dry Cleaning",
      "Smart Home"
    ],
    "coordinates": {
      "lat": 6.802773788393294,
      "lng": 4.5896815912913205
    },
    "listedDate": "2025-03-12T01:30:29.619Z",
    "featured": false
  },
  {
    "id": 27,
    "title": "Terrace house in Ogbunabali, Port Harcourt",
    "price": 29000000,
    "currency": "₦",
    "location": "Ogbunabali, Port Harcourt",
    "city": "Port Harcourt",
    "area": 50,
    "bedrooms": 4,
    "bathrooms": 4,
    "type": "terrace house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/terrace-house-1.jpg"
    ],
    "description": "Row of identical houses sharing side walls located in the prestigious Ogbunabali area of Port Harcourt. \n    This terrace house features 4 bedrooms and \n    4 bathrooms with approximately 50 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Gym",
      "Smart Home",
      "Sauna"
    ],
    "coordinates": {
      "lat": 4.606807521999139,
      "lng": 4.041199257724791
    },
    "listedDate": "2024-12-22T10:45:34.439Z",
    "featured": false
  },
  {
    "id": 28,
    "title": "Duplex in Maryland, Lagos",
    "price": 200000,
    "currency": "₦",
    "location": "Maryland, Lagos",
    "city": "Lagos",
    "area": 150,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "duplex",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/duplex-1.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Maryland area of Lagos. \n    This duplex features 2 bedrooms and \n    1 bathroom with approximately 150 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Club House",
      "Parking",
      "CCTV"
    ],
    "coordinates": {
      "lat": 6.424224912366343,
      "lng": 3.6195699936067185
    },
    "listedDate": "2025-03-26T22:12:23.473Z",
    "featured": false
  },
  {
    "id": 29,
    "title": "Office space in Garki, Abuja",
    "price": 2300000,
    "currency": "₦",
    "location": "Garki, Abuja",
    "city": "Abuja",
    "area": 1075,
    "bedrooms": 0,
    "bathrooms": 2,
    "type": "office space",
    "category": "commercial",
    "status": "for-rent",
    "images": [
      "/office-space-1.jpg",
      "/office-space-2.jpg",
      "/office-space-3.jpg",
      "/office-space-4.jpg"
    ],
    "description": "Commercial office property located in the prestigious Garki area of Abuja. \n    This office space features 0 bedrooms and \n    2 bathrooms with approximately 1075 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Gated Community",
      "Garden",
      "Club House"
    ],
    "coordinates": {
      "lat": 7.685153981701554,
      "lng": 4.342010334803668
    },
    "listedDate": "2024-12-05T07:47:40.177Z",
    "featured": false
  },
  {
    "id": 30,
    "title": "Commercial property in Gudu, Abuja",
    "price": 1700000,
    "currency": "₦",
    "location": "Gudu, Abuja",
    "city": "Abuja",
    "area": 175,
    "bedrooms": 0,
    "bathrooms": 3,
    "type": "commercial property",
    "category": "commercial",
    "status": "for-rent",
    "images": [
      "/commercial-property-1.jpg",
      "/commercial-property-2.jpg"
    ],
    "description": "Property for business use located in the prestigious Gudu area of Abuja. \n    This commercial property features 0 bedrooms and \n    3 bathrooms with approximately 175 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Generator"
    ],
    "coordinates": {
      "lat": 6.330006608075085,
      "lng": 3.552358425019896
    },
    "listedDate": "2024-10-18T17:10:34.641Z",
    "featured": true
  },
  {
    "id": 31,
    "title": "Penthouse in GRA Phase 1, Port Harcourt",
    "price": 76000000,
    "currency": "₦",
    "location": "GRA Phase 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 1100,
    "bedrooms": 5,
    "bathrooms": 4,
    "type": "penthouse",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/penthouse-1.jpg",
      "/penthouse-2.jpg",
      "/penthouse-3.jpg"
    ],
    "description": "Luxury apartment on the top floor of a building located in the prestigious GRA Phase 1 area of Port Harcourt. \n    This penthouse features 5 bedrooms and \n    4 bathrooms with approximately 1100 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Smart Home",
      "Concierge",
      "Swimming Pool",
      "Cinema",
      "24/7 Security",
      "Spa",
      "Balcony"
    ],
    "coordinates": {
      "lat": 4.691447118281745,
      "lng": 7.814090118566349
    },
    "listedDate": "2025-07-28T15:17:23.804Z",
    "featured": false
  },
  {
    "id": 32,
    "title": "Studio apartment in Ogbunabali, Port Harcourt",
    "price": 150000,
    "currency": "₦",
    "location": "Ogbunabali, Port Harcourt",
    "city": "Port Harcourt",
    "area": 60,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "studio apartment",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/studio-apartment-1.jpg",
      "/studio-apartment-2.jpg",
      "/studio-apartment-3.jpg",
      "/studio-apartment-4.jpg"
    ],
    "description": "Compact living space perfect for singles located in the prestigious Ogbunabali area of Port Harcourt. \n    This studio apartment features 1 bedroom and \n    1 bathroom with approximately 60 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Parking",
      "Generator",
      "Water Treatment",
      "Borehole",
      "Cinema",
      "Concierge"
    ],
    "coordinates": {
      "lat": 6.981124965292942,
      "lng": 3.8003943355910343
    },
    "listedDate": "2024-10-18T02:02:26.918Z",
    "featured": false
  },
  {
    "id": 33,
    "title": "Duplex in Magodo, Lagos",
    "price": 650000,
    "currency": "₦",
    "location": "Magodo, Lagos",
    "city": "Lagos",
    "area": 100,
    "bedrooms": 3,
    "bathrooms": 2,
    "type": "duplex",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/duplex-1.jpg",
      "/duplex-2.jpg",
      "/duplex-3.jpg",
      "/duplex-4.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Magodo area of Lagos. \n    This duplex features 3 bedrooms and \n    2 bathrooms with approximately 100 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Air Conditioning"
    ],
    "coordinates": {
      "lat": 7.686611231026744,
      "lng": 3.6388394227600176
    },
    "listedDate": "2025-02-16T17:42:10.375Z",
    "featured": false
  },
  {
    "id": 34,
    "title": "Duplex in Rumuokoro, Port Harcourt",
    "price": 950000,
    "currency": "₦",
    "location": "Rumuokoro, Port Harcourt",
    "city": "Port Harcourt",
    "area": 90,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "duplex",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/duplex-1.jpg",
      "/duplex-2.jpg",
      "/duplex-3.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Rumuokoro area of Port Harcourt. \n    This duplex features 4 bedrooms and \n    3 bathrooms with approximately 90 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Elevator",
      "Helipad"
    ],
    "coordinates": {
      "lat": 7.442067005256862,
      "lng": 4.451833674098021
    },
    "listedDate": "2025-01-03T07:58:03.951Z",
    "featured": true
  },
  {
    "id": 35,
    "title": "Terrace house in Rumuokoro, Port Harcourt",
    "price": 18000000,
    "currency": "₦",
    "location": "Rumuokoro, Port Harcourt",
    "city": "Port Harcourt",
    "area": 200,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "terrace house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/terrace-house-1.jpg",
      "/terrace-house-2.jpg"
    ],
    "description": "Row of identical houses sharing side walls located in the prestigious Rumuokoro area of Port Harcourt. \n    This terrace house features 4 bedrooms and \n    3 bathrooms with approximately 200 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Dry Cleaning",
      "Conference Room",
      "Business Center"
    ],
    "coordinates": {
      "lat": 6.903294198530635,
      "lng": 4.148510841726453
    },
    "listedDate": "2025-07-06T19:10:55.294Z",
    "featured": false
  },
  {
    "id": 36,
    "title": "Mansion in Katampe, Abuja",
    "price": 3900000,
    "currency": "₦",
    "location": "Katampe, Abuja",
    "city": "Abuja",
    "area": 500,
    "bedrooms": 5,
    "bathrooms": 5,
    "type": "mansion",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/mansion-1.jpg",
      "/mansion-2.jpg",
      "/mansion-3.jpg",
      "/mansion-4.jpg"
    ],
    "description": "Luxury large house with extensive grounds located in the prestigious Katampe area of Abuja. \n    This mansion features 5 bedrooms and \n    5 bathrooms with approximately 500 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Gym",
      "24/7 Security",
      "Spa",
      "Garden"
    ],
    "coordinates": {
      "lat": 7.5613589346527394,
      "lng": 4.478097797521861
    },
    "listedDate": "2025-09-06T04:57:56.501Z",
    "featured": true
  },
  {
    "id": 37,
    "title": "Apartment in Omole, Lagos",
    "price": 16000000,
    "currency": "₦",
    "location": "Omole, Lagos",
    "city": "Lagos",
    "area": 160,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "apartment",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/apartment-1.jpg",
      "/apartment-2.jpg",
      "/apartment-3.jpg",
      "/apartment-4.jpg"
    ],
    "description": "Modern apartment with amenities located in the prestigious Omole area of Lagos. \n    This apartment features 4 bedrooms and \n    3 bathrooms with approximately 160 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Parking",
      "Concierge",
      "Dry Cleaning"
    ],
    "coordinates": {
      "lat": 5.626350442778572,
      "lng": 4.420729892103268
    },
    "listedDate": "2025-03-29T02:39:56.450Z",
    "featured": false
  },
  {
    "id": 38,
    "title": "Commercial property in Trans-Amadi, Port Harcourt",
    "price": 2100000,
    "currency": "₦",
    "location": "Trans-Amadi, Port Harcourt",
    "city": "Port Harcourt",
    "area": 650,
    "bedrooms": 0,
    "bathrooms": 2,
    "type": "commercial property",
    "category": "commercial",
    "status": "for-rent",
    "images": [
      "/commercial-property-1.jpg",
      "/commercial-property-2.jpg",
      "/commercial-property-3.jpg"
    ],
    "description": "Property for business use located in the prestigious Trans-Amadi area of Port Harcourt. \n    This commercial property features 0 bedrooms and \n    2 bathrooms with approximately 650 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Air Conditioning"
    ],
    "coordinates": {
      "lat": 6.626754830300009,
      "lng": 4.8629335074827384
    },
    "listedDate": "2024-11-11T05:01:18.628Z",
    "featured": false
  },
  {
    "id": 39,
    "title": "Penthouse in Maitama, Abuja",
    "price": 15000000,
    "currency": "₦",
    "location": "Maitama, Abuja",
    "city": "Abuja",
    "area": 200,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "penthouse",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/penthouse-1.jpg"
    ],
    "description": "Luxury apartment on the top floor of a building located in the prestigious Maitama area of Abuja. \n    This penthouse features 3 bedrooms and \n    3 bathrooms with approximately 200 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Swimming Pool",
      "Concierge",
      "Gym",
      "24/7 Security",
      "Smart Home",
      "Squash Court"
    ],
    "coordinates": {
      "lat": 6.877857329275541,
      "lng": 4.3882309355508315
    },
    "listedDate": "2024-12-03T02:49:35.996Z",
    "featured": false
  },
  {
    "id": 40,
    "title": "Resort in Asokoro, Abuja",
    "price": 2400000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 1300,
    "bedrooms": 7,
    "bathrooms": 6,
    "type": "resort",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/resort-1.jpg"
    ],
    "description": "Luxury vacation property located in the prestigious Asokoro area of Abuja. \n    This resort features 7 bedrooms and \n    6 bathrooms with approximately 1300 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Smart Home",
      "Spa",
      "Cinema",
      "Concierge",
      "Elevator"
    ],
    "coordinates": {
      "lat": 7.1738099301765645,
      "lng": 7.406705981576536
    },
    "listedDate": "2024-11-30T20:11:50.160Z",
    "featured": false
  },
  {
    "id": 41,
    "title": "Villa in Asokoro, Abuja",
    "price": 29000000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 750,
    "bedrooms": 5,
    "bathrooms": 4,
    "type": "villa",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/villa-1.jpg",
      "/villa-2.jpg",
      "/villa-3.jpg",
      "/villa-4.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious Asokoro area of Abuja. \n    This villa features 5 bedrooms and \n    4 bathrooms with approximately 750 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Concierge",
      "Smart Home",
      "Cinema",
      "Swimming Pool",
      "Squash Court"
    ],
    "coordinates": {
      "lat": 6.185243333367972,
      "lng": 5.783752902170147
    },
    "listedDate": "2024-10-10T05:59:14.774Z",
    "featured": false
  },
  {
    "id": 42,
    "title": "Mansion in Katampe, Abuja",
    "price": 3100000,
    "currency": "₦",
    "location": "Katampe, Abuja",
    "city": "Abuja",
    "area": 900,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "mansion",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/mansion-1.jpg",
      "/mansion-2.jpg"
    ],
    "description": "Luxury large house with extensive grounds located in the prestigious Katampe area of Abuja. \n    This mansion features 2 bedrooms and \n    1 bathroom with approximately 900 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Concierge",
      "Cinema",
      "Gym",
      "Spa",
      "24/7 Security"
    ],
    "coordinates": {
      "lat": 6.146642751434296,
      "lng": 5.925128429944083
    },
    "listedDate": "2024-10-14T05:36:00.049Z",
    "featured": false
  },
  {
    "id": 43,
    "title": "Bungalow in Ojodu, Lagos",
    "price": 23000000,
    "currency": "₦",
    "location": "Ojodu, Lagos",
    "city": "Lagos",
    "area": 210,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "bungalow",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/bungalow-1.jpg"
    ],
    "description": "Single-story house located in the prestigious Ojodu area of Lagos. \n    This bungalow features 4 bedrooms and \n    3 bathrooms with approximately 210 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Water Treatment"
    ],
    "coordinates": {
      "lat": 4.979093411075981,
      "lng": 5.70597920619724
    },
    "listedDate": "2025-08-07T10:37:03.388Z",
    "featured": false
  },
  {
    "id": 44,
    "title": "Bungalow in Rumuokoro, Port Harcourt",
    "price": 600000,
    "currency": "₦",
    "location": "Rumuokoro, Port Harcourt",
    "city": "Port Harcourt",
    "area": 120,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "bungalow",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/bungalow-1.jpg",
      "/bungalow-2.jpg"
    ],
    "description": "Single-story house located in the prestigious Rumuokoro area of Port Harcourt. \n    This bungalow features 3 bedrooms and \n    3 bathrooms with approximately 120 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Sauna",
      "Basketball Court"
    ],
    "coordinates": {
      "lat": 5.819021606026694,
      "lng": 6.191816888153627
    },
    "listedDate": "2025-06-05T12:50:40.454Z",
    "featured": false
  },
  {
    "id": 45,
    "title": "Penthouse in Katampe, Abuja",
    "price": 86000000,
    "currency": "₦",
    "location": "Katampe, Abuja",
    "city": "Abuja",
    "area": 1150,
    "bedrooms": 4,
    "bathrooms": 4,
    "type": "penthouse",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/penthouse-1.jpg",
      "/penthouse-2.jpg",
      "/penthouse-3.jpg",
      "/penthouse-4.jpg"
    ],
    "description": "Luxury apartment on the top floor of a building located in the prestigious Katampe area of Abuja. \n    This penthouse features 4 bedrooms and \n    4 bathrooms with approximately 1150 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Swimming Pool",
      "Smart Home",
      "Cinema",
      "CCTV",
      "Air Conditioning",
      "Elevator"
    ],
    "coordinates": {
      "lat": 6.842438738660727,
      "lng": 6.576793350289489
    },
    "listedDate": "2024-12-23T02:02:06.907Z",
    "featured": false
  },
  {
    "id": 46,
    "title": "Farmhouse in Ikeja GRA, Lagos",
    "price": 15000000,
    "currency": "₦",
    "location": "Ikeja GRA, Lagos",
    "city": "Lagos",
    "area": 70,
    "bedrooms": 4,
    "bathrooms": 4,
    "type": "farmhouse",
    "category": "rural",
    "status": "for-sale",
    "images": [
      "/farmhouse-1.jpg",
      "/farmhouse-2.jpg"
    ],
    "description": "House on agricultural land located in the prestigious Ikeja GRA area of Lagos. \n    This farmhouse features 4 bedrooms and \n    4 bathrooms with approximately 70 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Spa",
      "CCTV"
    ],
    "coordinates": {
      "lat": 7.636588536517993,
      "lng": 6.119342628351702
    },
    "listedDate": "2025-08-30T18:55:50.915Z",
    "featured": false
  },
  {
    "id": 47,
    "title": "Penthouse in Maitama, Abuja",
    "price": 1400000,
    "currency": "₦",
    "location": "Maitama, Abuja",
    "city": "Abuja",
    "area": 700,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "penthouse",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/penthouse-1.jpg"
    ],
    "description": "Luxury apartment on the top floor of a building located in the prestigious Maitama area of Abuja. \n    This penthouse features 3 bedrooms and \n    3 bathrooms with approximately 700 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Gym",
      "24/7 Security",
      "Spa",
      "Concierge",
      "Cinema",
      "Swimming Pool",
      "CCTV",
      "Borehole"
    ],
    "coordinates": {
      "lat": 6.397008485454756,
      "lng": 7.296038211144919
    },
    "listedDate": "2025-05-10T15:22:56.913Z",
    "featured": true
  },
  {
    "id": 48,
    "title": "Mansion in GRA Phase 1, Port Harcourt",
    "price": 61000000,
    "currency": "₦",
    "location": "GRA Phase 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 1350,
    "bedrooms": 5,
    "bathrooms": 4,
    "type": "mansion",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/mansion-1.jpg"
    ],
    "description": "Luxury large house with extensive grounds located in the prestigious GRA Phase 1 area of Port Harcourt. \n    This mansion features 5 bedrooms and \n    4 bathrooms with approximately 1350 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Cinema",
      "24/7 Security",
      "Swimming Pool",
      "Gated Community",
      "Playground",
      "Squash Court"
    ],
    "coordinates": {
      "lat": 8.27246959790991,
      "lng": 8.009636644067665
    },
    "listedDate": "2025-08-15T13:45:40.510Z",
    "featured": false
  },
  {
    "id": 49,
    "title": "Townhouse in Gbagada, Lagos",
    "price": 200000,
    "currency": "₦",
    "location": "Gbagada, Lagos",
    "city": "Lagos",
    "area": 80,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "townhouse",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg",
      "/townhouse-3.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Gbagada area of Lagos. \n    This townhouse features 2 bedrooms and \n    2 bathrooms with approximately 80 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Playground"
    ],
    "coordinates": {
      "lat": 7.508068609832147,
      "lng": 4.748558682356025
    },
    "listedDate": "2024-11-08T16:46:08.456Z",
    "featured": false
  },
  {
    "id": 50,
    "title": "Studio apartment in Lugbe, Abuja",
    "price": 31000000,
    "currency": "₦",
    "location": "Lugbe, Abuja",
    "city": "Abuja",
    "area": 150,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "studio apartment",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/studio-apartment-1.jpg"
    ],
    "description": "Compact living space perfect for singles located in the prestigious Lugbe area of Abuja. \n    This studio apartment features 3 bedrooms and \n    3 bathrooms with approximately 150 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Generator",
      "Water Treatment",
      "Helipad",
      "CCTV",
      "Tennis Court"
    ],
    "coordinates": {
      "lat": 5.481300019280215,
      "lng": 6.200535906338652
    },
    "listedDate": "2025-02-15T14:20:53.994Z",
    "featured": false
  },
  {
    "id": 51,
    "title": "Mansion in Katampe, Abuja",
    "price": 91000000,
    "currency": "₦",
    "location": "Katampe, Abuja",
    "city": "Abuja",
    "area": 400,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "mansion",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/mansion-1.jpg",
      "/mansion-2.jpg",
      "/mansion-3.jpg"
    ],
    "description": "Luxury large house with extensive grounds located in the prestigious Katampe area of Abuja. \n    This mansion features 2 bedrooms and \n    2 bathrooms with approximately 400 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Spa",
      "Gym",
      "Borehole",
      "Air Conditioning",
      "Balcony"
    ],
    "coordinates": {
      "lat": 8.230497092192254,
      "lng": 6.668766858670119
    },
    "listedDate": "2025-08-12T08:21:11.466Z",
    "featured": false
  },
  {
    "id": 52,
    "title": "Villa in GRA Phase 1, Port Harcourt",
    "price": 2900000,
    "currency": "₦",
    "location": "GRA Phase 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 1300,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "villa",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/villa-1.jpg",
      "/villa-2.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious GRA Phase 1 area of Port Harcourt. \n    This villa features 2 bedrooms and \n    1 bathroom with approximately 1300 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Spa",
      "24/7 Security",
      "Concierge",
      "Cinema",
      "Smart Home",
      "BBQ Area",
      "Children's Play Area",
      "Laundry"
    ],
    "coordinates": {
      "lat": 7.963240167857079,
      "lng": 3.496256398153619
    },
    "listedDate": "2025-04-14T21:54:58.883Z",
    "featured": false
  },
  {
    "id": 53,
    "title": "Duplex in Rumuodara, Port Harcourt",
    "price": 21000000,
    "currency": "₦",
    "location": "Rumuodara, Port Harcourt",
    "city": "Port Harcourt",
    "area": 200,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "duplex",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/duplex-1.jpg",
      "/duplex-2.jpg",
      "/duplex-3.jpg",
      "/duplex-4.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Rumuodara area of Port Harcourt. \n    This duplex features 2 bedrooms and \n    1 bathroom with approximately 200 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Swimming Pool",
      "Garden"
    ],
    "coordinates": {
      "lat": 6.380706602989601,
      "lng": 8.115399257814879
    },
    "listedDate": "2025-06-11T05:19:13.870Z",
    "featured": true
  },
  {
    "id": 54,
    "title": "Townhouse in Mile 4, Port Harcourt",
    "price": 24000000,
    "currency": "₦",
    "location": "Mile 4, Port Harcourt",
    "city": "Port Harcourt",
    "area": 70,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "townhouse",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg",
      "/townhouse-3.jpg",
      "/townhouse-4.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Mile 4 area of Port Harcourt. \n    This townhouse features 2 bedrooms and \n    1 bathroom with approximately 70 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Borehole",
      "CCTV",
      "Elevator"
    ],
    "coordinates": {
      "lat": 6.038529369645044,
      "lng": 7.325721180311857
    },
    "listedDate": "2025-06-09T12:04:37.231Z",
    "featured": false
  },
  {
    "id": 55,
    "title": "Bungalow in Ogbunabali, Port Harcourt",
    "price": 24000000,
    "currency": "₦",
    "location": "Ogbunabali, Port Harcourt",
    "city": "Port Harcourt",
    "area": 70,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "bungalow",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/bungalow-1.jpg",
      "/bungalow-2.jpg",
      "/bungalow-3.jpg",
      "/bungalow-4.jpg"
    ],
    "description": "Single-story house located in the prestigious Ogbunabali area of Port Harcourt. \n    This bungalow features 2 bedrooms and \n    1 bathroom with approximately 70 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Gym",
      "Air Conditioning"
    ],
    "coordinates": {
      "lat": 7.887105068110144,
      "lng": 3.5398235114013215
    },
    "listedDate": "2025-02-06T20:55:50.446Z",
    "featured": false
  },
  {
    "id": 56,
    "title": "Duplex in Garki, Abuja",
    "price": 28000000,
    "currency": "₦",
    "location": "Garki, Abuja",
    "city": "Abuja",
    "area": 150,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "duplex",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/duplex-1.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Garki area of Abuja. \n    This duplex features 3 bedrooms and \n    3 bathrooms with approximately 150 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Laundry",
      "Parking"
    ],
    "coordinates": {
      "lat": 7.388132374495307,
      "lng": 7.406895543247322
    },
    "listedDate": "2025-07-10T04:41:57.963Z",
    "featured": false
  },
  {
    "id": 57,
    "title": "Semi-detached house in Yaba, Lagos",
    "price": 250000,
    "currency": "₦",
    "location": "Yaba, Lagos",
    "city": "Lagos",
    "area": 200,
    "bedrooms": 3,
    "bathrooms": 2,
    "type": "semi-detached house",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/semi-detached-house-1.jpg",
      "/semi-detached-house-2.jpg"
    ],
    "description": "House sharing one common wall located in the prestigious Yaba area of Lagos. \n    This semi-detached house features 3 bedrooms and \n    2 bathrooms with approximately 200 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Squash Court",
      "Gated Community"
    ],
    "coordinates": {
      "lat": 7.501222134650821,
      "lng": 3.5083753130952937
    },
    "listedDate": "2025-02-28T02:05:54.570Z",
    "featured": true
  },
  {
    "id": 58,
    "title": "Townhouse in Jabi, Abuja",
    "price": 700000,
    "currency": "₦",
    "location": "Jabi, Abuja",
    "city": "Abuja",
    "area": 210,
    "bedrooms": 3,
    "bathrooms": 2,
    "type": "townhouse",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/townhouse-1.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Jabi area of Abuja. \n    This townhouse features 3 bedrooms and \n    2 bathrooms with approximately 210 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Dry Cleaning"
    ],
    "coordinates": {
      "lat": 4.646076503345341,
      "lng": 6.934200401457318
    },
    "listedDate": "2025-05-22T03:46:01.402Z",
    "featured": false
  },
  {
    "id": 59,
    "title": "Detached house in Garki, Abuja",
    "price": 29000000,
    "currency": "₦",
    "location": "Garki, Abuja",
    "city": "Abuja",
    "area": 240,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "detached house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/detached-house-1.jpg",
      "/detached-house-2.jpg",
      "/detached-house-3.jpg"
    ],
    "description": "Standalone house with private compound located in the prestigious Garki area of Abuja. \n    This detached house features 4 bedrooms and \n    3 bathrooms with approximately 240 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Helipad",
      "Parking"
    ],
    "coordinates": {
      "lat": 6.53740463792008,
      "lng": 3.785578887959205
    },
    "listedDate": "2025-01-24T06:48:08.128Z",
    "featured": true
  },
  {
    "id": 60,
    "title": "Detached house in Abuloma, Port Harcourt",
    "price": 500000,
    "currency": "₦",
    "location": "Abuloma, Port Harcourt",
    "city": "Port Harcourt",
    "area": 80,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "detached house",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/detached-house-1.jpg",
      "/detached-house-2.jpg"
    ],
    "description": "Standalone house with private compound located in the prestigious Abuloma area of Port Harcourt. \n    This detached house features 2 bedrooms and \n    2 bathrooms with approximately 80 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Squash Court"
    ],
    "coordinates": {
      "lat": 4.676319401368187,
      "lng": 5.586998698413033
    },
    "listedDate": "2024-09-17T12:46:37.081Z",
    "featured": false
  },
  {
    "id": 61,
    "title": "Warehouse in GRA Phase 2, Port Harcourt",
    "price": 2000000,
    "currency": "₦",
    "location": "GRA Phase 2, Port Harcourt",
    "city": "Port Harcourt",
    "area": 225,
    "bedrooms": 0,
    "bathrooms": 2,
    "type": "warehouse",
    "category": "industrial",
    "status": "for-rent",
    "images": [
      "/warehouse-1.jpg",
      "/warehouse-2.jpg"
    ],
    "description": "Storage or industrial space located in the prestigious GRA Phase 2 area of Port Harcourt. \n    This warehouse features 0 bedrooms and \n    2 bathrooms with approximately 225 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "BBQ Area",
      "Club House",
      "Swimming Pool"
    ],
    "coordinates": {
      "lat": 7.540090406876854,
      "lng": 5.427668135529299
    },
    "listedDate": "2024-11-30T06:04:54.508Z",
    "featured": false
  },
  {
    "id": 62,
    "title": "Studio apartment in Rumuokoro, Port Harcourt",
    "price": 750000,
    "currency": "₦",
    "location": "Rumuokoro, Port Harcourt",
    "city": "Port Harcourt",
    "area": 50,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "studio apartment",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/studio-apartment-1.jpg"
    ],
    "description": "Compact living space perfect for singles located in the prestigious Rumuokoro area of Port Harcourt. \n    This studio apartment features 1 bedroom and \n    1 bathroom with approximately 50 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Parking",
      "Playground"
    ],
    "coordinates": {
      "lat": 8.089968560630421,
      "lng": 6.739128651270848
    },
    "listedDate": "2025-03-11T18:49:46.534Z",
    "featured": true
  },
  {
    "id": 63,
    "title": "Mansion in GRA Phase 1, Port Harcourt",
    "price": 2300000,
    "currency": "₦",
    "location": "GRA Phase 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 1100,
    "bedrooms": 6,
    "bathrooms": 5,
    "type": "mansion",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/mansion-1.jpg",
      "/mansion-2.jpg"
    ],
    "description": "Luxury large house with extensive grounds located in the prestigious GRA Phase 1 area of Port Harcourt. \n    This mansion features 6 bedrooms and \n    5 bathrooms with approximately 1100 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Smart Home",
      "Swimming Pool",
      "Cinema",
      "Concierge",
      "Business Center"
    ],
    "coordinates": {
      "lat": 6.570358341974716,
      "lng": 5.353767204275746
    },
    "listedDate": "2025-03-10T21:21:09.524Z",
    "featured": true
  },
  {
    "id": 64,
    "title": "Resort in Victoria Island, Lagos",
    "price": 47000000,
    "currency": "₦",
    "location": "Victoria Island, Lagos",
    "city": "Lagos",
    "area": 650,
    "bedrooms": 5,
    "bathrooms": 5,
    "type": "resort",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/resort-1.jpg",
      "/resort-2.jpg",
      "/resort-3.jpg",
      "/resort-4.jpg"
    ],
    "description": "Luxury vacation property located in the prestigious Victoria Island area of Lagos. \n    This resort features 5 bedrooms and \n    5 bathrooms with approximately 650 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Spa",
      "Concierge",
      "Swimming Pool",
      "Cinema",
      "Smart Home",
      "Garden",
      "CCTV",
      "BBQ Area"
    ],
    "coordinates": {
      "lat": 7.650429510612868,
      "lng": 3.4806391726827695
    },
    "listedDate": "2025-07-01T17:56:43.751Z",
    "featured": false
  },
  {
    "id": 65,
    "title": "Apartment in Rumuomasi, Port Harcourt",
    "price": 11000000,
    "currency": "₦",
    "location": "Rumuomasi, Port Harcourt",
    "city": "Port Harcourt",
    "area": 50,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "apartment",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/apartment-1.jpg",
      "/apartment-2.jpg"
    ],
    "description": "Modern apartment with amenities located in the prestigious Rumuomasi area of Port Harcourt. \n    This apartment features 3 bedrooms and \n    3 bathrooms with approximately 50 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Water Treatment"
    ],
    "coordinates": {
      "lat": 7.650543946151375,
      "lng": 4.796745850557334
    },
    "listedDate": "2025-04-05T15:12:25.497Z",
    "featured": false
  },
  {
    "id": 66,
    "title": "Townhouse in Garki, Abuja",
    "price": 850000,
    "currency": "₦",
    "location": "Garki, Abuja",
    "city": "Abuja",
    "area": 50,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "townhouse",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Garki area of Abuja. \n    This townhouse features 4 bedrooms and \n    3 bathrooms with approximately 50 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Cinema",
      "Borehole"
    ],
    "coordinates": {
      "lat": 4.798067517914593,
      "lng": 3.992961976493759
    },
    "listedDate": "2025-05-07T01:04:06.808Z",
    "featured": false
  },
  {
    "id": 67,
    "title": "Office space in Garki, Abuja",
    "price": 2400000,
    "currency": "₦",
    "location": "Garki, Abuja",
    "city": "Abuja",
    "area": 225,
    "bedrooms": 0,
    "bathrooms": 1,
    "type": "office space",
    "category": "commercial",
    "status": "for-rent",
    "images": [
      "/office-space-1.jpg"
    ],
    "description": "Commercial office property located in the prestigious Garki area of Abuja. \n    This office space features 0 bedrooms and \n    1 bathroom with approximately 225 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Spa"
    ],
    "coordinates": {
      "lat": 6.7121892907457665,
      "lng": 6.823650255461037
    },
    "listedDate": "2025-08-15T21:16:17.636Z",
    "featured": false
  },
  {
    "id": 68,
    "title": "Bungalow in Gudu, Abuja",
    "price": 11000000,
    "currency": "₦",
    "location": "Gudu, Abuja",
    "city": "Abuja",
    "area": 70,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "bungalow",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/bungalow-1.jpg"
    ],
    "description": "Single-story house located in the prestigious Gudu area of Abuja. \n    This bungalow features 1 bedroom and \n    1 bathroom with approximately 70 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Garden",
      "Smart Home"
    ],
    "coordinates": {
      "lat": 6.261933432065101,
      "lng": 8.214247365864548
    },
    "listedDate": "2025-01-16T18:19:24.092Z",
    "featured": false
  },
  {
    "id": 69,
    "title": "Office space in Ajah, Lagos",
    "price": 25000000,
    "currency": "₦",
    "location": "Ajah, Lagos",
    "city": "Lagos",
    "area": 575,
    "bedrooms": 0,
    "bathrooms": 2,
    "type": "office space",
    "category": "commercial",
    "status": "for-sale",
    "images": [
      "/office-space-1.jpg",
      "/office-space-2.jpg",
      "/office-space-3.jpg"
    ],
    "description": "Commercial office property located in the prestigious Ajah area of Lagos. \n    This office space features 0 bedrooms and \n    2 bathrooms with approximately 575 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Water Treatment",
      "Dry Cleaning",
      "BBQ Area"
    ],
    "coordinates": {
      "lat": 7.817148487969456,
      "lng": 3.6922893321090258
    },
    "listedDate": "2024-12-14T10:15:44.974Z",
    "featured": false
  },
  {
    "id": 70,
    "title": "Duplex in Rumuodara, Port Harcourt",
    "price": 14000000,
    "currency": "₦",
    "location": "Rumuodara, Port Harcourt",
    "city": "Port Harcourt",
    "area": 50,
    "bedrooms": 3,
    "bathrooms": 3,
    "type": "duplex",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/duplex-1.jpg",
      "/duplex-2.jpg",
      "/duplex-3.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Rumuodara area of Port Harcourt. \n    This duplex features 3 bedrooms and \n    3 bathrooms with approximately 50 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Dry Cleaning"
    ],
    "coordinates": {
      "lat": 8.104312849809402,
      "lng": 7.165403967744964
    },
    "listedDate": "2025-01-25T17:56:09.911Z",
    "featured": true
  },
  {
    "id": 71,
    "title": "Mansion in Maitama, Abuja",
    "price": 1200000,
    "currency": "₦",
    "location": "Maitama, Abuja",
    "city": "Abuja",
    "area": 400,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "mansion",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/mansion-1.jpg",
      "/mansion-2.jpg"
    ],
    "description": "Luxury large house with extensive grounds located in the prestigious Maitama area of Abuja. \n    This mansion features 4 bedrooms and \n    3 bathrooms with approximately 400 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Concierge",
      "Smart Home",
      "Cinema",
      "Gym",
      "Swimming Pool",
      "Spa",
      "Garden",
      "Elevator"
    ],
    "coordinates": {
      "lat": 7.113655993639375,
      "lng": 4.910282977580271
    },
    "listedDate": "2024-12-16T15:40:49.407Z",
    "featured": false
  },
  {
    "id": 72,
    "title": "Warehouse in Gudu, Abuja",
    "price": 1800000,
    "currency": "₦",
    "location": "Gudu, Abuja",
    "city": "Abuja",
    "area": 750,
    "bedrooms": 0,
    "bathrooms": 1,
    "type": "warehouse",
    "category": "industrial",
    "status": "for-rent",
    "images": [
      "/warehouse-1.jpg",
      "/warehouse-2.jpg",
      "/warehouse-3.jpg"
    ],
    "description": "Storage or industrial space located in the prestigious Gudu area of Abuja. \n    This warehouse features 0 bedrooms and \n    1 bathroom with approximately 750 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "CCTV"
    ],
    "coordinates": {
      "lat": 7.804213135812315,
      "lng": 6.533520977330673
    },
    "listedDate": "2024-10-14T16:53:01.972Z",
    "featured": true
  },
  {
    "id": 73,
    "title": "Semi-detached house in Surulere, Lagos",
    "price": 250000,
    "currency": "₦",
    "location": "Surulere, Lagos",
    "city": "Lagos",
    "area": 100,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "semi-detached house",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/semi-detached-house-1.jpg",
      "/semi-detached-house-2.jpg",
      "/semi-detached-house-3.jpg",
      "/semi-detached-house-4.jpg"
    ],
    "description": "House sharing one common wall located in the prestigious Surulere area of Lagos. \n    This semi-detached house features 2 bedrooms and \n    1 bathroom with approximately 100 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Helipad"
    ],
    "coordinates": {
      "lat": 7.879370497341566,
      "lng": 4.90768239238652
    },
    "listedDate": "2025-06-16T08:14:27.034Z",
    "featured": false
  },
  {
    "id": 74,
    "title": "Townhouse in Mile 1, Port Harcourt",
    "price": 25000000,
    "currency": "₦",
    "location": "Mile 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 60,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "townhouse",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Mile 1 area of Port Harcourt. \n    This townhouse features 1 bedroom and \n    1 bathroom with approximately 60 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Water Treatment",
      "Basketball Court"
    ],
    "coordinates": {
      "lat": 6.421153903981549,
      "lng": 8.128370666961935
    },
    "listedDate": "2025-02-05T03:51:11.869Z",
    "featured": false
  },
  {
    "id": 75,
    "title": "Resort in Maitama, Abuja",
    "price": 61000000,
    "currency": "₦",
    "location": "Maitama, Abuja",
    "city": "Abuja",
    "area": 1350,
    "bedrooms": 3,
    "bathrooms": 2,
    "type": "resort",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/resort-1.jpg",
      "/resort-2.jpg"
    ],
    "description": "Luxury vacation property located in the prestigious Maitama area of Abuja. \n    This resort features 3 bedrooms and \n    2 bathrooms with approximately 1350 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Swimming Pool",
      "Cinema",
      "Smart Home",
      "24/7 Security",
      "Gym",
      "Helipad",
      "Business Center"
    ],
    "coordinates": {
      "lat": 6.320692478317696,
      "lng": 8.007033626173815
    },
    "listedDate": "2025-09-06T12:26:27.967Z",
    "featured": false
  },
  {
    "id": 76,
    "title": "Apartment in Ajah, Lagos",
    "price": 500000,
    "currency": "₦",
    "location": "Ajah, Lagos",
    "city": "Lagos",
    "area": 240,
    "bedrooms": 3,
    "bathrooms": 2,
    "type": "apartment",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/apartment-1.jpg",
      "/apartment-2.jpg",
      "/apartment-3.jpg"
    ],
    "description": "Modern apartment with amenities located in the prestigious Ajah area of Lagos. \n    This apartment features 3 bedrooms and \n    2 bathrooms with approximately 240 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Parking",
      "BBQ Area"
    ],
    "coordinates": {
      "lat": 6.016761410211697,
      "lng": 3.8060493319771562
    },
    "listedDate": "2024-12-27T03:30:49.403Z",
    "featured": false
  },
  {
    "id": 77,
    "title": "Duplex in Mile 1, Port Harcourt",
    "price": 19000000,
    "currency": "₦",
    "location": "Mile 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 110,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "duplex",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/duplex-1.jpg",
      "/duplex-2.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Mile 1 area of Port Harcourt. \n    This duplex features 1 bedroom and \n    1 bathroom with approximately 110 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Air Conditioning",
      "Business Center"
    ],
    "coordinates": {
      "lat": 5.867325191753498,
      "lng": 7.59755196870604
    },
    "listedDate": "2025-01-31T05:19:38.145Z",
    "featured": false
  },
  {
    "id": 78,
    "title": "Commercial property in Maryland, Lagos",
    "price": 37000000,
    "currency": "₦",
    "location": "Maryland, Lagos",
    "city": "Lagos",
    "area": 750,
    "bedrooms": 0,
    "bathrooms": 2,
    "type": "commercial property",
    "category": "commercial",
    "status": "for-sale",
    "images": [
      "/commercial-property-1.jpg",
      "/commercial-property-2.jpg",
      "/commercial-property-3.jpg"
    ],
    "description": "Property for business use located in the prestigious Maryland area of Lagos. \n    This commercial property features 0 bedrooms and \n    2 bathrooms with approximately 750 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Generator"
    ],
    "coordinates": {
      "lat": 6.649934298185288,
      "lng": 8.287252267867256
    },
    "listedDate": "2025-02-27T06:30:11.056Z",
    "featured": false
  },
  {
    "id": 79,
    "title": "Townhouse in Lugbe, Abuja",
    "price": 750000,
    "currency": "₦",
    "location": "Lugbe, Abuja",
    "city": "Abuja",
    "area": 60,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "townhouse",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg",
      "/townhouse-3.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Lugbe area of Abuja. \n    This townhouse features 1 bedroom and \n    1 bathroom with approximately 60 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "CCTV"
    ],
    "coordinates": {
      "lat": 5.873841143348929,
      "lng": 6.0557326952223605
    },
    "listedDate": "2025-03-29T06:28:39.530Z",
    "featured": true
  },
  {
    "id": 80,
    "title": "Townhouse in Mile 1, Port Harcourt",
    "price": 20000000,
    "currency": "₦",
    "location": "Mile 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 110,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "townhouse",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg",
      "/townhouse-3.jpg",
      "/townhouse-4.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Mile 1 area of Port Harcourt. \n    This townhouse features 1 bedroom and \n    1 bathroom with approximately 110 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Spa",
      "BBQ Area"
    ],
    "coordinates": {
      "lat": 5.0663557927806115,
      "lng": 5.611396347939587
    },
    "listedDate": "2024-12-21T06:40:54.708Z",
    "featured": true
  },
  {
    "id": 81,
    "title": "Apartment in Ogbunabali, Port Harcourt",
    "price": 100000,
    "currency": "₦",
    "location": "Ogbunabali, Port Harcourt",
    "city": "Port Harcourt",
    "area": 90,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "apartment",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/apartment-1.jpg",
      "/apartment-2.jpg"
    ],
    "description": "Modern apartment with amenities located in the prestigious Ogbunabali area of Port Harcourt. \n    This apartment features 1 bedroom and \n    1 bathroom with approximately 90 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Generator",
      "Water Treatment",
      "Gated Community",
      "Tennis Court"
    ],
    "coordinates": {
      "lat": 7.363069313268045,
      "lng": 5.118824237826982
    },
    "listedDate": "2025-07-17T02:53:30.582Z",
    "featured": true
  },
  {
    "id": 82,
    "title": "Duplex in Rumuomasi, Port Harcourt",
    "price": 900000,
    "currency": "₦",
    "location": "Rumuomasi, Port Harcourt",
    "city": "Port Harcourt",
    "area": 50,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "duplex",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/duplex-1.jpg"
    ],
    "description": "Two-story residential unit located in the prestigious Rumuomasi area of Port Harcourt. \n    This duplex features 4 bedrooms and \n    3 bathrooms with approximately 50 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Playground"
    ],
    "coordinates": {
      "lat": 5.527552655796643,
      "lng": 7.135473480129095
    },
    "listedDate": "2025-08-22T05:57:15.713Z",
    "featured": false
  },
  {
    "id": 83,
    "title": "Villa in Lekki Phase 1, Lagos",
    "price": 65000000,
    "currency": "₦",
    "location": "Lekki Phase 1, Lagos",
    "city": "Lagos",
    "area": 650,
    "bedrooms": 6,
    "bathrooms": 5,
    "type": "villa",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/villa-1.jpg",
      "/villa-2.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious Lekki Phase 1 area of Lagos. \n    This villa features 6 bedrooms and \n    5 bathrooms with approximately 650 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Smart Home",
      "24/7 Security",
      "Swimming Pool",
      "Concierge",
      "Gym",
      "Spa",
      "Generator"
    ],
    "coordinates": {
      "lat": 5.3581182196314305,
      "lng": 5.218341009928476
    },
    "listedDate": "2025-01-15T13:30:02.570Z",
    "featured": false
  },
  {
    "id": 84,
    "title": "Office space in Trans-Amadi, Port Harcourt",
    "price": 45000000,
    "currency": "₦",
    "location": "Trans-Amadi, Port Harcourt",
    "city": "Port Harcourt",
    "area": 750,
    "bedrooms": 0,
    "bathrooms": 2,
    "type": "office space",
    "category": "commercial",
    "status": "for-sale",
    "images": [
      "/office-space-1.jpg"
    ],
    "description": "Commercial office property located in the prestigious Trans-Amadi area of Port Harcourt. \n    This office space features 0 bedrooms and \n    2 bathrooms with approximately 750 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Parking",
      "Swimming Pool"
    ],
    "coordinates": {
      "lat": 6.114566007731323,
      "lng": 4.318860571966013
    },
    "listedDate": "2025-05-22T22:25:26.187Z",
    "featured": false
  },
  {
    "id": 85,
    "title": "Terrace house in Ogudu, Lagos",
    "price": 13000000,
    "currency": "₦",
    "location": "Ogudu, Lagos",
    "city": "Lagos",
    "area": 160,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "terrace house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/terrace-house-1.jpg",
      "/terrace-house-2.jpg"
    ],
    "description": "Row of identical houses sharing side walls located in the prestigious Ogudu area of Lagos. \n    This terrace house features 4 bedrooms and \n    3 bathrooms with approximately 160 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Smart Home",
      "Parking",
      "Conference Room"
    ],
    "coordinates": {
      "lat": 4.6501773088606875,
      "lng": 5.230849641894179
    },
    "listedDate": "2024-10-04T17:45:20.750Z",
    "featured": false
  },
  {
    "id": 86,
    "title": "Semi-detached house in Gwarinpa, Abuja",
    "price": 11000000,
    "currency": "₦",
    "location": "Gwarinpa, Abuja",
    "city": "Abuja",
    "area": 60,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "semi-detached house",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/semi-detached-house-1.jpg",
      "/semi-detached-house-2.jpg"
    ],
    "description": "House sharing one common wall located in the prestigious Gwarinpa area of Abuja. \n    This semi-detached house features 4 bedrooms and \n    3 bathrooms with approximately 60 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Tennis Court",
      "Helipad",
      "Parking"
    ],
    "coordinates": {
      "lat": 5.065240529658229,
      "lng": 5.556595571983748
    },
    "listedDate": "2025-05-01T00:40:41.849Z",
    "featured": true
  },
  {
    "id": 87,
    "title": "Bungalow in Rumuomasi, Port Harcourt",
    "price": 18000000,
    "currency": "₦",
    "location": "Rumuomasi, Port Harcourt",
    "city": "Port Harcourt",
    "area": 190,
    "bedrooms": 1,
    "bathrooms": 1,
    "type": "bungalow",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/bungalow-1.jpg",
      "/bungalow-2.jpg"
    ],
    "description": "Single-story house located in the prestigious Rumuomasi area of Port Harcourt. \n    This bungalow features 1 bedroom and \n    1 bathroom with approximately 190 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Air Conditioning"
    ],
    "coordinates": {
      "lat": 5.97851614588525,
      "lng": 3.6432406331147638
    },
    "listedDate": "2025-06-23T01:14:08.348Z",
    "featured": false
  },
  {
    "id": 88,
    "title": "Luxury apartment in Ikoyi, Lagos",
    "price": 2800000,
    "currency": "₦",
    "location": "Ikoyi, Lagos",
    "city": "Lagos",
    "area": 1500,
    "bedrooms": 4,
    "bathrooms": 4,
    "type": "luxury apartment",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/luxury-apartment-1.jpg",
      "/luxury-apartment-2.jpg",
      "/luxury-apartment-3.jpg",
      "/luxury-apartment-4.jpg"
    ],
    "description": "High-end apartment with premium features located in the prestigious Ikoyi area of Lagos. \n    This luxury apartment features 4 bedrooms and \n    4 bathrooms with approximately 1500 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Spa",
      "Smart Home",
      "Gym",
      "Balcony",
      "Swimming Pool"
    ],
    "coordinates": {
      "lat": 7.375764067407748,
      "lng": 6.117346929861377
    },
    "listedDate": "2024-11-27T08:47:46.188Z",
    "featured": false
  },
  {
    "id": 89,
    "title": "Resort in Asokoro, Abuja",
    "price": 14000000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 750,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "resort",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/resort-1.jpg",
      "/resort-2.jpg",
      "/resort-3.jpg"
    ],
    "description": "Luxury vacation property located in the prestigious Asokoro area of Abuja. \n    This resort features 4 bedrooms and \n    3 bathrooms with approximately 750 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Gym",
      "Spa",
      "Smart Home",
      "Cinema",
      "Swimming Pool"
    ],
    "coordinates": {
      "lat": 5.094235198311303,
      "lng": 6.575266982845869
    },
    "listedDate": "2024-10-04T19:15:34.632Z",
    "featured": false
  },
  {
    "id": 90,
    "title": "Penthouse in GRA Phase 1, Port Harcourt",
    "price": 65000000,
    "currency": "₦",
    "location": "GRA Phase 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 300,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "penthouse",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/penthouse-1.jpg",
      "/penthouse-2.jpg"
    ],
    "description": "Luxury apartment on the top floor of a building located in the prestigious GRA Phase 1 area of Port Harcourt. \n    This penthouse features 2 bedrooms and \n    2 bathrooms with approximately 300 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Cinema",
      "Swimming Pool",
      "Concierge",
      "Gym",
      "Smart Home",
      "24/7 Security",
      "Borehole",
      "Jacuzzi",
      "BBQ Area"
    ],
    "coordinates": {
      "lat": 6.723721654207346,
      "lng": 5.72262756847404
    },
    "listedDate": "2025-06-02T11:17:46.255Z",
    "featured": true
  },
  {
    "id": 91,
    "title": "Townhouse in Ojodu, Lagos",
    "price": 28000000,
    "currency": "₦",
    "location": "Ojodu, Lagos",
    "city": "Lagos",
    "area": 190,
    "bedrooms": 4,
    "bathrooms": 4,
    "type": "townhouse",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/townhouse-1.jpg",
      "/townhouse-2.jpg"
    ],
    "description": "Multi-floor home sharing walls with adjacent properties located in the prestigious Ojodu area of Lagos. \n    This townhouse features 4 bedrooms and \n    4 bathrooms with approximately 190 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Business Center"
    ],
    "coordinates": {
      "lat": 6.662693984967236,
      "lng": 7.2010406264102205
    },
    "listedDate": "2025-02-13T23:40:41.295Z",
    "featured": false
  },
  {
    "id": 92,
    "title": "Bungalow in Mile 4, Port Harcourt",
    "price": 23000000,
    "currency": "₦",
    "location": "Mile 4, Port Harcourt",
    "city": "Port Harcourt",
    "area": 120,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "bungalow",
    "category": "residential",
    "status": "for-sale",
    "images": [
      "/bungalow-1.jpg",
      "/bungalow-2.jpg",
      "/bungalow-3.jpg"
    ],
    "description": "Single-story house located in the prestigious Mile 4 area of Port Harcourt. \n    This bungalow features 2 bedrooms and \n    1 bathroom with approximately 120 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Air Conditioning"
    ],
    "coordinates": {
      "lat": 8.25790890853191,
      "lng": 6.473428655357989
    },
    "listedDate": "2025-06-25T08:32:55.681Z",
    "featured": false
  },
  {
    "id": 93,
    "title": "Resort in Katampe, Abuja",
    "price": 2600000,
    "currency": "₦",
    "location": "Katampe, Abuja",
    "city": "Abuja",
    "area": 550,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "resort",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/resort-1.jpg",
      "/resort-2.jpg",
      "/resort-3.jpg"
    ],
    "description": "Luxury vacation property located in the prestigious Katampe area of Abuja. \n    This resort features 4 bedrooms and \n    3 bathrooms with approximately 550 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Swimming Pool",
      "Spa",
      "24/7 Security",
      "Concierge",
      "Smart Home",
      "Air Conditioning",
      "Squash Court",
      "Children's Play Area"
    ],
    "coordinates": {
      "lat": 5.547657553612225,
      "lng": 3.5402042634772615
    },
    "listedDate": "2025-04-18T18:16:09.487Z",
    "featured": true
  },
  {
    "id": 94,
    "title": "Villa in Ikoyi, Lagos",
    "price": 1000000,
    "currency": "₦",
    "location": "Ikoyi, Lagos",
    "city": "Lagos",
    "area": 250,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "villa",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/villa-1.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious Ikoyi area of Lagos. \n    This villa features 2 bedrooms and \n    2 bathrooms with approximately 250 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Gym",
      "Spa",
      "Concierge",
      "Cinema",
      "24/7 Security",
      "Sauna"
    ],
    "coordinates": {
      "lat": 4.954870985064436,
      "lng": 5.640264538351331
    },
    "listedDate": "2025-01-28T13:23:30.245Z",
    "featured": false
  },
  {
    "id": 95,
    "title": "Luxury apartment in Asokoro, Abuja",
    "price": 3900000,
    "currency": "₦",
    "location": "Asokoro, Abuja",
    "city": "Abuja",
    "area": 1250,
    "bedrooms": 7,
    "bathrooms": 6,
    "type": "luxury apartment",
    "category": "luxury",
    "status": "for-rent",
    "images": [
      "/luxury-apartment-1.jpg",
      "/luxury-apartment-2.jpg",
      "/luxury-apartment-3.jpg"
    ],
    "description": "High-end apartment with premium features located in the prestigious Asokoro area of Abuja. \n    This luxury apartment features 7 bedrooms and \n    6 bathrooms with approximately 1250 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Cinema",
      "Smart Home",
      "Helipad"
    ],
    "coordinates": {
      "lat": 4.886242466232605,
      "lng": 8.203750107039568
    },
    "listedDate": "2025-08-16T08:10:52.823Z",
    "featured": false
  },
  {
    "id": 96,
    "title": "Villa in Ikoyi, Lagos",
    "price": 29000000,
    "currency": "₦",
    "location": "Ikoyi, Lagos",
    "city": "Lagos",
    "area": 1650,
    "bedrooms": 2,
    "bathrooms": 2,
    "type": "villa",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/villa-1.jpg"
    ],
    "description": "Luxury country house with gardens located in the prestigious Ikoyi area of Lagos. \n    This villa features 2 bedrooms and \n    2 bathrooms with approximately 1650 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Smart Home",
      "Spa",
      "Gym",
      "Cinema",
      "Concierge",
      "Garden"
    ],
    "coordinates": {
      "lat": 5.218216427224018,
      "lng": 5.213333701689407
    },
    "listedDate": "2025-03-06T02:14:09.172Z",
    "featured": true
  },
  {
    "id": 97,
    "title": "Luxury apartment in GRA Phase 1, Port Harcourt",
    "price": 18000000,
    "currency": "₦",
    "location": "GRA Phase 1, Port Harcourt",
    "city": "Port Harcourt",
    "area": 700,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "luxury apartment",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/luxury-apartment-1.jpg",
      "/luxury-apartment-2.jpg",
      "/luxury-apartment-3.jpg",
      "/luxury-apartment-4.jpg"
    ],
    "description": "High-end apartment with premium features located in the prestigious GRA Phase 1 area of Port Harcourt. \n    This luxury apartment features 4 bedrooms and \n    3 bathrooms with approximately 700 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "24/7 Security",
      "Concierge",
      "Swimming Pool",
      "Spa",
      "Cinema",
      "Gym",
      "Helipad",
      "Garden"
    ],
    "coordinates": {
      "lat": 5.234945728537786,
      "lng": 6.832256653745659
    },
    "listedDate": "2025-07-24T03:17:32.916Z",
    "featured": false
  },
  {
    "id": 98,
    "title": "Luxury apartment in Maitama, Abuja",
    "price": 19000000,
    "currency": "₦",
    "location": "Maitama, Abuja",
    "city": "Abuja",
    "area": 1050,
    "bedrooms": 4,
    "bathrooms": 3,
    "type": "luxury apartment",
    "category": "luxury",
    "status": "for-sale",
    "images": [
      "/luxury-apartment-1.jpg",
      "/luxury-apartment-2.jpg",
      "/luxury-apartment-3.jpg"
    ],
    "description": "High-end apartment with premium features located in the prestigious Maitama area of Abuja. \n    This luxury apartment features 4 bedrooms and \n    3 bathrooms with approximately 1050 square meters of space. \n    currently on the market at a competitive price.",
    "amenities": [
      "Gym",
      "Concierge",
      "Spa",
      "24/7 Security",
      "Swimming Pool",
      "Balcony"
    ],
    "coordinates": {
      "lat": 5.412602714556744,
      "lng": 7.007016245258006
    },
    "listedDate": "2025-08-07T17:19:55.341Z",
    "featured": true
  },
  {
    "id": 99,
    "title": "Terrace house in Gwarinpa, Abuja",
    "price": 400000,
    "currency": "₦",
    "location": "Gwarinpa, Abuja",
    "city": "Abuja",
    "area": 220,
    "bedrooms": 2,
    "bathrooms": 1,
    "type": "terrace house",
    "category": "residential",
    "status": "for-rent",
    "images": [
      "/terrace-house-1.jpg",
      "/terrace-house-2.jpg"
    ],
    "description": "Row of identical houses sharing side walls located in the prestigious Gwarinpa area of Abuja. \n    This terrace house features 2 bedrooms and \n    1 bathroom with approximately 220 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Gated Community",
      "Parking"
    ],
    "coordinates": {
      "lat": 4.8504211309718785,
      "lng": 6.129500990805431
    },
    "listedDate": "2025-08-24T14:16:15.570Z",
    "featured": false
  },
  {
    "id": 100,
    "title": "Office space in Lugbe, Abuja",
    "price": 500000,
    "currency": "₦",
    "location": "Lugbe, Abuja",
    "city": "Abuja",
    "area": 900,
    "bedrooms": 0,
    "bathrooms": 3,
    "type": "office space",
    "category": "commercial",
    "status": "for-rent",
    "images": [
      "/office-space-1.jpg",
      "/office-space-2.jpg",
      "/office-space-3.jpg",
      "/office-space-4.jpg"
    ],
    "description": "Commercial office property located in the prestigious Lugbe area of Abuja. \n    This office space features 0 bedrooms and \n    3 bathrooms with approximately 900 square meters of space. \n    available for rent at a competitive price.",
    "amenities": [
      "Smart Home",
      "Helipad",
      "Garden"
    ],
    "coordinates": {
      "lat": 4.764757524666614,
      "lng": 3.7156916793108845
    },
    "listedDate": "2024-10-16T19:37:40.542Z",
    "featured": false
  }
];

// GET /api/properties - Get all properties with filtering
router.get('/', (req, res) => {
  try {
    const { 
      type, 
      status, 
      minPrice, 
      maxPrice, 
      bedrooms, 
      location, 
      page = 1, 
      limit = 10 
    } = req.query;

    let filteredProperties = [...mockProperties];

    // Apply filters
    if (type) {
      filteredProperties = filteredProperties.filter(p => p.type === type);
    }
    if (status) {
      filteredProperties = filteredProperties.filter(p => p.status === status);
    }
    if (minPrice) {
      filteredProperties = filteredProperties.filter(p => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filteredProperties = filteredProperties.filter(p => p.price <= parseInt(maxPrice));
    }
    if (bedrooms) {
      filteredProperties = filteredProperties.filter(p => p.bedrooms >= parseInt(bedrooms));
    }
    if (location) {
      filteredProperties = filteredProperties.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedProperties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredProperties.length / limit),
        totalItems: filteredProperties.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties',
      message: error.message
    });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const property = mockProperties.find(p => p.id === parseInt(id));

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property',
      message: error.message
    });
  }
});

// POST /api/properties - Create new property
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('location').notEmpty().withMessage('Location is required'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a positive integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a positive integer'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('type').isIn(['apartment', 'house', 'condo', 'townhouse']).withMessage('Invalid property type'),
  body('status').isIn(['for-rent', 'for-sale']).withMessage('Invalid property status')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const newProperty = {
      id: mockProperties.length + 1,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    mockProperties.push(newProperty);

    res.status(201).json({
      success: true,
      data: newProperty,
      message: 'Property created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create property',
      message: error.message
    });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const propertyIndex = mockProperties.findIndex(p => p.id === parseInt(id));

    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    mockProperties[propertyIndex] = {
      ...mockProperties[propertyIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockProperties[propertyIndex],
      message: 'Property updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update property',
      message: error.message
    });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const propertyIndex = mockProperties.findIndex(p => p.id === parseInt(id));

    if (propertyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    mockProperties.splice(propertyIndex, 1);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete property',
      message: error.message
    });
  }
});

export default router;
