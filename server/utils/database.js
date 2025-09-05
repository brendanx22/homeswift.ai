// Mock database utilities for development
// In production, replace with actual database connection (MongoDB, PostgreSQL, etc.)

export class MockDatabase {
  constructor() {
    this.properties = [
      {
        id: 1,
        title: "Modern 2BR Apartment in Victoria Island",
        price: 2500000,
        location: "Victoria Island, Lagos",
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        type: "apartment",
        status: "for-rent",
        images: ["/2bedroommainland.jpg"],
        description: "Beautiful modern apartment with ocean views",
        amenities: ["Swimming Pool", "Gym", "Security", "Parking"],
        coordinates: { lat: 6.4281, lng: 3.4219 },
        createdAt: "2024-01-15T10:30:00Z"
      },
      {
        id: 2,
        title: "Luxury 3BR House in Lekki",
        price: 5000000,
        location: "Lekki Phase 1, Lagos",
        bedrooms: 3,
        bathrooms: 3,
        area: 2000,
        type: "house",
        status: "for-sale",
        images: ["/EkoAtlanticCity.jpg"],
        description: "Spacious family home in prime location",
        amenities: ["Garden", "Garage", "Security", "Generator"],
        coordinates: { lat: 6.4698, lng: 3.5852 },
        createdAt: "2024-01-20T14:15:00Z"
      }
    ];

    this.users = [
      {
        id: 1,
        email: "admin@homeswift.com",
        password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isVerified: true,
        savedProperties: [],
        createdAt: "2024-01-01T00:00:00Z"
      }
    ];
  }

  // Property methods
  getAllProperties(filters = {}) {
    let filtered = [...this.properties];
    
    if (filters.type) {
      filtered = filtered.filter(p => p.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.location) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    return filtered;
  }

  getPropertyById(id) {
    return this.properties.find(p => p.id === parseInt(id));
  }

  createProperty(propertyData) {
    const newProperty = {
      id: this.properties.length + 1,
      ...propertyData,
      createdAt: new Date().toISOString()
    };
    this.properties.push(newProperty);
    return newProperty;
  }

  updateProperty(id, updateData) {
    const index = this.properties.findIndex(p => p.id === parseInt(id));
    if (index === -1) return null;
    
    this.properties[index] = {
      ...this.properties[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return this.properties[index];
  }

  deleteProperty(id) {
    const index = this.properties.findIndex(p => p.id === parseInt(id));
    if (index === -1) return false;
    
    this.properties.splice(index, 1);
    return true;
  }

  // User methods
  getAllUsers() {
    return this.users.map(({ password, ...user }) => user);
  }

  getUserById(id) {
    const user = this.users.find(u => u.id === parseInt(id));
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  createUser(userData) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      savedProperties: [],
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  updateUser(id, updateData) {
    const index = this.users.findIndex(u => u.id === parseInt(id));
    if (index === -1) return null;
    
    this.users[index] = {
      ...this.users[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    const { password, ...userWithoutPassword } = this.users[index];
    return userWithoutPassword;
  }

  // Search methods
  searchProperties(query, filters = {}) {
    let results = this.getAllProperties(filters);
    
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(property =>
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return results;
  }
}

// Export singleton instance
export const db = new MockDatabase();
