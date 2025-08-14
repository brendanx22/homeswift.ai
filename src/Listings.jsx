import React from 'react';
import { ArrowLeft, Home, Star, BookmarkPlus, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Listings = () => {
  const navigate = useNavigate();
  
  // Sample listing data
  const sections = [
    {
      name: "Luxury Homes",
      listings: [
        {
          id: 1,
          title: "GRA Phase 1",
          price: "1,100,000",
          type: "For Sale",
          image: "/GRAPhase1.png",
          favorite: false
        },
        {
          id: 2,
          title: "Banana Island Villa",
          price: "2,500,000",
          type: "For Sale",
          image: "/bananaislandvilla.jpg",
          favorite: true
        },
        {
          id: 7,
          title: "Victoria Crest Penthouse",
          price: "4,000,000",
          type: "For Sale",
          image: "/victoriacrestpenthouse.jpg",
          favorite: false
        },
        {
          id: 8,
          title: "Eko Atlantic Tower",
          price: "5,500,000",
          type: "For Sale",
          image: "/EkoAtlanticCity.jpg",
          favorite: true
        },
        {
          id: 17,
          title: "Palm Grove Estate",
          price: "3,800,000",
          type: "For Sale",
          image: "/pamgrooveestate.jpg",
          favorite: false
        },
        {
          id: 18,
          title: "Ocean View Mansion",
          price: "6,200,000",
          type: "For Sale",
          image: "/oceanviewmansion.jpg",
          favorite: true
        },
      ]
    },
    {
      name: "Affordable Apartments",
      listings: [
        {
          id: 3,
          title: "Studio Flat Lekki",
          price: "400,000",
          type: "For Rent",
          image: "/studioflatlekki.jpg",
          favorite: false
        },
        {
          id: 4,
          title: "2-Bedroom Mainland",
          price: "600,000",
          type: "For Rent",
          image: "/2bedroommainland.jpg",
          favorite: true
        },
        {
          id: 9,
          title: "Mini Flat Yaba",
          price: "350,000",
          type: "For Rent",
          image: "/miniflatyaba.jpg",
          favorite: false
        },
        {
          id: 10,
          title: "Shared Apartment Surulere",
          price: "250,000",
          type: "For Rent",
          image: "/sharedapartment.jpg",
          favorite: true
        },
        {
          id: 19,
          title: "1-Bedroom Ajah",
          price: "300,000",
          type: "For Rent",
          image: "/1bedroom.jpg",
          favorite: false
        },
        {
          id: 20,
          title: "Studio Flat Ikeja",
          price: "320,000",
          type: "For Rent",
          image: "/studioflatikeja.jpg",
          favorite: true
        },
      ]
    },
    {
      name: "Family Houses",
      listings: [
        {
          id: 5,
          title: "GRA Phase 2",
          price: "1,200,000",
          type: "For Sale",
          image: "/GRAPhase1.png",
          favorite: false
        },
        {
          id: 6,
          title: "Ikoyi Mansion",
          price: "3,000,000",
          type: "For Sale",
          image: "/image.png",
          favorite: true
        },
        {
          id: 11,
          title: "Magodo Duplex",
          price: "2,000,000",
          type: "For Sale",
          image: "/magododuplex.jpg",
          favorite: false
        },
        {
          id: 12,
          title: "Ajah Family Home",
          price: "1,500,000",
          type: "For Sale",
          image: "/ajahfamilyhouse.jpg",
          favorite: true
        },
        {
          id: 21,
          title: "Lekki Family Duplex",
          price: "2,200,000",
          type: "For Sale",
          image: "/lekkidupex.jpg",
          favorite: false
        },
        {
          id: 22,
          title: "Surulere Family Home",
          price: "1,700,000",
          type: "For Sale",
          image: "/surulerefamilyhouse.jpg",
          favorite: true
        },
      ]
    },
    {
      name: "Short Lets",
      listings: [
        {
          id: 13,
          title: "Lekki Short Stay",
          price: "120,000",
          type: "For Rent",
          image: "/lekkishortstay.jpg",
          favorite: false
        },
        {
          id: 14,
          title: "Victoria Island Weekend",
          price: "200,000",
          type: "For Rent",
          image: "/victoriaislandweekend.jpg",
          favorite: true
        },
        {
          id: 23,
          title: "Ajah Short Let",
          price: "150,000",
          type: "For Rent",
          image: "/ajahshortlet.jpg",
          favorite: false
        },
        {
          id: 24,
          title: "Mainland Short Stay",
          price: "180,000",
          type: "For Rent",
          image: "/mainlandshortstay.jpg",
          favorite: true
        },
      ]
    },
    {
      name: "Student Hostels",
      listings: [
        {
          id: 15,
          title: "Unilag Hostel Room",
          price: "80,000",
          type: "For Rent",
          image: "/unilaghostel.jpeg",
          favorite: false
        },
        {
          id: 16,
          title: "Covenant Hostel",
          price: "100,000",
          type: "For Rent",
          image: "/convenanthostel.jpg",
          favorite: true
        },
        {
          id: 25,
          title: "LASU Hostel",
          price: "90,000",
          type: "For Rent",
          image: "/lasuhostel.jpg",
          favorite: false
        },
        {
          id: 26,
          title: "Babcock Hostel",
          price: "110,000",
          type: "For Rent",
          image: "/babcockhostel.jpg",
          favorite: true
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#181A1B]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#181A1B]/95 backdrop-blur-md shadow-lg p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Group 129.png" alt="HomeSwift Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover" />
            <h1 className="text-lg sm:text-xl font-bold text-white">HomeSwift</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Home 
              size={20} 
              className="text-white hover:text-blue-500 transition-colors duration-200" 
              onClick={() => navigate('/')} 
              style={{ cursor: 'pointer' }}
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 pt-24">
  {/* Results Header */}
  <div className="mb-8 mt-6">
          <h2 className="text-4xl font-bold text-white mb-2">House Listings</h2>
          <p className="text-gray-300 text-lg">
            Here are the houses that matches your prompt. <span className="inline-block align-middle">✨</span>
          </p>
        </div>

        {/* Listings Sections with Carousel on Mobile */}
        {sections.map((section, idx) => (
          <div key={section.name} className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">{section.name}</h3>
            {/* Carousel for mobile, grid for desktop */}
            <div className="block md:hidden">
              <div className="flex overflow-x-auto gap-6 pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {section.listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="min-w-[80vw] max-w-xs relative bg-[#23262b] rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border border-gray-400/30 flex flex-col justify-end min-h-[320px]"
                    style={{ backgroundImage: `url(${listing.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    <div className="absolute inset-0 bg-black/30"></div>
                    <button className="absolute top-2 left-2 p-2 rounded-full shadow z-10" style={{ background: '#40403E' }}>
                      <BookmarkPlus size={20} className="text-white" />
                    </button>
                    <div className={
                      `absolute top-2 right-2 px-4 py-1 rounded-xl text-xs sm:text-sm font-bold z-10 shadow-lg ` +
                      (listing.type === 'For Sale' || listing.type === 'For Rent'
                        ? 'bg-[#40403E] text-white'
                        : 'bg-[#2563eb] text-white')
                    }>
                      {listing.type}
                    </div>
                    <div className="relative z-10 p-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-white drop-shadow">{listing.title}</h3>
                        <span className="text-lg font-bold text-white drop-shadow">₦{listing.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {section.listings.slice(0, 4).map((listing, idx) => (
                <div
                  key={listing.id}
                  className="relative bg-[#23262b] rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border border-gray-400/30 flex flex-col justify-end min-h-[320px]"
                  style={{ backgroundImage: `url(${listing.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-black/30"></div>
                  <button className="absolute top-2 left-2 p-2 rounded-full shadow z-10" style={{ background: '#40403E' }}>
                    <BookmarkPlus size={20} className="text-white" />
                  </button>
                  <div className={
                    `absolute top-2 right-2 px-4 py-1 rounded-xl text-xs sm:text-sm font-bold z-10 shadow-lg ` +
                    (listing.type === 'For Sale' || listing.type === 'For Rent'
                      ? 'bg-[#40403E] text-white'
                      : 'bg-[#2563eb] text-white')
                  }>
                    {listing.type}
                  </div>
                  <div className="relative z-10 p-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-bold text-white drop-shadow">{listing.title}</h3>
                      <span className="text-lg font-bold text-white drop-shadow">₦{listing.price}</span>
                    </div>
                  </div>
                </div>
              ))}
              {section.listings.length > 4 && (
                <div className="col-span-full flex justify-end mt-4">
                  <button className="bg-[#40403E] hover:bg-[#23262b] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow" onClick={() => alert('Show all properties for ' + section.name)}>
                    View All
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className="my-8 border-t border-gray-200"></div>
      </main>
    </div>
  );
};

export default Listings;