import { supabase } from "../lib/supabase.js";

const propertyController = {
  // 🔍 Search properties
  async searchProperties(req, res) {
    try {
      const {
        q,
        minPrice,
        maxPrice,
        bedrooms,
        propertyType,
        location,
        status = "active",
        sortBy = "created_at",
        sortOrder = "desc",
        limit = 12,
        page = 1,
      } = req.query;

      let query = supabase
        .from("properties")
        .select("*, agent:users(*), images:property_images(*)", {
          count: "exact",
        })
        .eq("status", status);

      // Search text
      if (q) {
        query = query.or(
          `title.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%,zipcode.ilike.%${q}%`
        );
      }

      // Filters
      if (minPrice) query = query.gte("price", parseFloat(minPrice));
      if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
      if (bedrooms) {
        if (bedrooms.endsWith("+"))
          query = query.gte("bedrooms", parseInt(bedrooms));
        else query = query.eq("bedrooms", parseInt(bedrooms));
      }
      if (propertyType) {
        if (Array.isArray(propertyType))
          query = query.in("property_type", propertyType);
        else query = query.eq("property_type", propertyType);
      }
      if (location) {
        query = query.or(
          `address.ilike.%${location}%,city.ilike.%${location}%,state.ilike.%${location}%,zipcode.ilike.%${location}%`
        );
      }

      // Sorting
      const sortFieldMap = {
        price: "price",
        bedrooms: "bedrooms",
        bathrooms: "bathrooms",
        areaSqft: "area_sqft",
        yearBuilt: "year_built",
        createdAt: "created_at",
        updatedAt: "updated_at",
      };
      const dbSortField = sortFieldMap[sortBy] || "created_at";
      const ascending = sortOrder?.toLowerCase() === "asc";

      // Pagination
      const pageSize = Math.min(parseInt(limit) || 12, 100);
      const currentPage = Math.max(parseInt(page) || 1, 1);
      const offset = (currentPage - 1) * pageSize;

      // Execute
      const { data, error, count } = await query
        .order(dbSortField, { ascending })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      res.json({
        success: true,
        total: count || 0,
        page: currentPage,
        totalPages: Math.ceil((count || 0) / pageSize),
        data: data || [],
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search properties",
        details: error.message,
      });
    }
  },

  // 📦 Get all properties
  async getProperties(req, res) {
    try {
      const {
        minPrice,
        maxPrice,
        bedrooms,
        minBathrooms,
        maxBathrooms,
        propertyType,
        city,
        state,
        minSqft,
        maxSqft,
        yearBuilt,
        sortBy = "created_at",
        sortOrder = "desc",
        limit = 10,
        page = 1,
      } = req.query;

      let query = supabase
        .from("properties")
        .select("*, agent:users(*), images:property_images(*)", {
          count: "exact",
        });

      if (minPrice) query = query.gte("price", parseFloat(minPrice));
      if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
      if (bedrooms) {
        if (bedrooms.endsWith("+"))
          query = query.gte("bedrooms", parseInt(bedrooms));
        else query = query.eq("bedrooms", parseInt(bedrooms));
      }
      if (minBathrooms)
        query = query.gte("bathrooms", parseFloat(minBathrooms));
      if (maxBathrooms)
        query = query.lte("bathrooms", parseFloat(maxBathrooms));
      if (propertyType) {
        if (Array.isArray(propertyType))
          query = query.in("property_type", propertyType);
        else query = query.eq("property_type", propertyType);
      }
      if (city) query = query.ilike("city", `%${city}%`);
      if (state) query = query.ilike("state", `%${state}%`);
      if (minSqft) query = query.gte("area_sqft", parseInt(minSqft));
      if (maxSqft) query = query.lte("area_sqft", parseInt(maxSqft));
      if (yearBuilt) query = query.gte("year_built", parseInt(yearBuilt));

      const sortFieldMap = {
        price: "price",
        bedrooms: "bedrooms",
        bathrooms: "bathrooms",
        areaSqft: "area_sqft",
        yearBuilt: "year_built",
        createdAt: "created_at",
        updatedAt: "updated_at",
      };
      const dbSortField = sortFieldMap[sortBy] || "created_at";
      const ascending = sortOrder?.toLowerCase() === "asc";

      const pageSize = Math.min(parseInt(limit) || 10, 100);
      const currentPage = Math.max(parseInt(page) || 1, 1);
      const offset = (currentPage - 1) * pageSize;

      const { data, error, count } = await query
        .order(dbSortField, { ascending })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      res.json({
        success: true,
        total: count || 0,
        page: currentPage,
        totalPages: Math.ceil((count || 0) / pageSize),
        data: data || [],
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch properties",
        details: error.message,
      });
    }
  },

  // 🌟 Get featured properties
  async getFeaturedProperties(req, res) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*, agent:users(*), images:property_images(*)")
        .eq("is_featured", true)
        .limit(6);

      if (error) throw error;

      res.json({ success: true, data });
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 🏡 Get single property
  async getPropertyById(req, res) {
    try {
      const { id } = req.params;

      const { data: property, error } = await supabase
        .from("properties")
        .select(
          "*, agent:users(*), images:property_images(*), reviews:reviews(*, user:users(id,name,avatar))"
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!property)
        return res
          .status(404)
          .json({ success: false, error: "Property not found" });

      res.json({ success: true, data: property });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ➕ Create new property
  async createProperty(req, res) {
    try {
      const {
        title,
        description,
        price,
        bedrooms,
        bathrooms,
        area,
        address,
        city,
        state,
        zipcode,
        propertyType,
        features,
        status = "draft",
      } = req.body;

      const { data, error } = await supabase
        .from("properties")
        .insert([
          {
            title,
            description,
            price: parseFloat(price),
            bedrooms: parseInt(bedrooms),
            bathrooms: parseFloat(bathrooms),
            area_sqft: parseInt(area),
            address,
            city,
            state,
            zipcode,
            property_type: propertyType,
            features: features || {},
            status,
            agent_id: req.user?.id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ✏️ Update property
  async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data)
        return res
          .status(404)
          .json({ success: false, error: "Property not found" });

      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // 🗑️ Delete property
  async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      await supabase.from("property_images").delete().eq("property_id", id);
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;

      res.json({ success: true, message: "Property deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

export default propertyController;
