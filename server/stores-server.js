const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /stores - Get all store locations
router.get('/stores', async (req, res) => {
  try {
    const stores = await persist.readJSON('stores.json');
    const storesArray = Object.values(stores);
    
    // If no stores exist, return sample data
    if (storesArray.length === 0) {
      const sampleStores = [
        {
          id: "store_1",
          name: "NBA Thread Flagship - Los Angeles",
          type: "Flagship",
          address: "1234 Sunset Boulevard",
          city: "Los Angeles",
          state: "CA",
          zip: "90028",
          phone: "(323) 555-0123",
          employees: 25,
          rating: 4.8,
          featured: true,
          hours: {
            monday: "10:00 AM - 9:00 PM",
            tuesday: "10:00 AM - 9:00 PM",
            wednesday: "10:00 AM - 9:00 PM",
            thursday: "10:00 AM - 9:00 PM",
            friday: "10:00 AM - 10:00 PM",
            saturday: "9:00 AM - 10:00 PM",
            sunday: "11:00 AM - 8:00 PM"
          }
        },
        {
          id: "store_2",
          name: "NBA Thread - New York",
          type: "Flagship",
          address: "5678 Broadway",
          city: "New York",
          state: "NY",
          zip: "10019",
          phone: "(212) 555-0456",
          employees: 30,
          rating: 4.7,
          featured: false,
          hours: {
            monday: "10:00 AM - 9:00 PM",
            tuesday: "10:00 AM - 9:00 PM",
            wednesday: "10:00 AM - 9:00 PM",
            thursday: "10:00 AM - 9:00 PM",
            friday: "10:00 AM - 10:00 PM",
            saturday: "9:00 AM - 10:00 PM",
            sunday: "11:00 AM - 8:00 PM"
          }
        },
        {
          id: "store_3",
          name: "NBA Thread Outlet - Chicago",
          type: "Outlet",
          address: "9012 Michigan Avenue",
          city: "Chicago",
          state: "IL",
          zip: "60611",
          phone: "(312) 555-0789",
          employees: 15,
          rating: 4.5,
          featured: false,
          hours: {
            monday: "10:00 AM - 8:00 PM",
            tuesday: "10:00 AM - 8:00 PM",
            wednesday: "10:00 AM - 8:00 PM",
            thursday: "10:00 AM - 8:00 PM",
            friday: "10:00 AM - 9:00 PM",
            saturday: "9:00 AM - 9:00 PM",
            sunday: "11:00 AM - 7:00 PM"
          }
        },
        {
          id: "store_4",
          name: "NBA Thread - Miami",
          type: "Flagship",
          address: "3456 Ocean Drive",
          city: "Miami",
          state: "FL",
          zip: "33139",
          phone: "(305) 555-0321",
          employees: 20,
          rating: 4.6,
          featured: true,
          hours: {
            monday: "10:00 AM - 9:00 PM",
            tuesday: "10:00 AM - 9:00 PM",
            wednesday: "10:00 AM - 9:00 PM",
            thursday: "10:00 AM - 9:00 PM",
            friday: "10:00 AM - 10:00 PM",
            saturday: "9:00 AM - 10:00 PM",
            sunday: "11:00 AM - 8:00 PM"
          }
        },
        {
          id: "store_5",
          name: "NBA Thread Express - Dallas",
          type: "Kiosk",
          address: "7890 North Park Center",
          city: "Dallas",
          state: "TX",
          zip: "75225",
          phone: "(214) 555-0654",
          employees: 8,
          rating: 4.3,
          featured: false,
          hours: {
            monday: "10:00 AM - 9:00 PM",
            tuesday: "10:00 AM - 9:00 PM",
            wednesday: "10:00 AM - 9:00 PM",
            thursday: "10:00 AM - 9:00 PM",
            friday: "10:00 AM - 10:00 PM",
            saturday: "10:00 AM - 10:00 PM",
            sunday: "12:00 PM - 8:00 PM"
          }
        },
        {
          id: "store_6",
          name: "NBA Thread - Boston",
          type: "Flagship",
          address: "2468 Newbury Street",
          city: "Boston",
          state: "MA",
          zip: "02116",
          phone: "(617) 555-0987",
          employees: 22,
          rating: 4.7,
          featured: false,
          hours: {
            monday: "10:00 AM - 8:00 PM",
            tuesday: "10:00 AM - 8:00 PM",
            wednesday: "10:00 AM - 8:00 PM",
            thursday: "10:00 AM - 8:00 PM",
            friday: "10:00 AM - 9:00 PM",
            saturday: "9:00 AM - 9:00 PM",
            sunday: "11:00 AM - 7:00 PM"
          }
        }
      ];

      // Save sample data for future use
      const storesObject = {};
      sampleStores.forEach(store => {
        storesObject[store.id] = store;
      });
      await persist.writeJSON('stores.json', storesObject);

      return res.json(sampleStores);
    }
    
    res.json(storesArray);
  } catch (error) {
    console.error('Error loading stores:', error);
    
    // Return sample data if error occurs
    const sampleStores = [
      {
        id: "store_1",
        name: "NBA Thread Flagship - Los Angeles",
        type: "Flagship",
        address: "1234 Sunset Boulevard",
        city: "Los Angeles",
        state: "CA",
        zip: "90028",
        phone: "(323) 555-0123",
        employees: 25,
        rating: 4.8,
        featured: true,
        hours: {
          monday: "10:00 AM - 9:00 PM",
          tuesday: "10:00 AM - 9:00 PM",
          wednesday: "10:00 AM - 9:00 PM",
          thursday: "10:00 AM - 9:00 PM",
          friday: "10:00 AM - 10:00 PM",
          saturday: "9:00 AM - 10:00 PM",
          sunday: "11:00 AM - 8:00 PM"
        }
      },
      {
        id: "store_2",
        name: "NBA Thread - New York",
        type: "Flagship",
        address: "5678 Broadway",
        city: "New York",
        state: "NY",
        zip: "10019",
        phone: "(212) 555-0456",
        employees: 30,
        rating: 4.7,
        featured: false,
        hours: {
          monday: "10:00 AM - 9:00 PM",
          tuesday: "10:00 AM - 9:00 PM",
          wednesday: "10:00 AM - 9:00 PM",
          thursday: "10:00 AM - 9:00 PM",
          friday: "10:00 AM - 10:00 PM",
          saturday: "9:00 AM - 10:00 PM",
          sunday: "11:00 AM - 8:00 PM"
        }
      },
      {
        id: "store_3",
        name: "NBA Thread Outlet - Chicago",
        type: "Outlet",
        address: "9012 Michigan Avenue",
        city: "Chicago",
        state: "IL",
        zip: "60611",
        phone: "(312) 555-0789",
        employees: 15,
        rating: 4.5,
        featured: false,
        hours: {
          monday: "10:00 AM - 8:00 PM",
          tuesday: "10:00 AM - 8:00 PM",
          wednesday: "10:00 AM - 8:00 PM",
          thursday: "10:00 AM - 8:00 PM",
          friday: "10:00 AM - 9:00 PM",
          saturday: "9:00 AM - 9:00 PM",
          sunday: "11:00 AM - 7:00 PM"
        }
      },
      {
        id: "store_4",
        name: "NBA Thread - Miami",
        type: "Flagship",
        address: "3456 Ocean Drive",
        city: "Miami",
        state: "FL",
        zip: "33139",
        phone: "(305) 555-0321",
        employees: 20,
        rating: 4.6,
        featured: true,
        hours: {
          monday: "10:00 AM - 9:00 PM",
          tuesday: "10:00 AM - 9:00 PM",
          wednesday: "10:00 AM - 9:00 PM",
          thursday: "10:00 AM - 9:00 PM",
          friday: "10:00 AM - 10:00 PM",
          saturday: "9:00 AM - 10:00 PM",
          sunday: "11:00 AM - 8:00 PM"
          }
        },
        {
          id: "store_5",
          name: "NBA Thread Express - Dallas",
          type: "Kiosk",
          address: "7890 North Park Center",
          city: "Dallas",
          state: "TX",
          zip: "75225",
          phone: "(214) 555-0654",
          employees: 8,
          rating: 4.3,
          featured: false,
          hours: {
            monday: "10:00 AM - 9:00 PM",
            tuesday: "10:00 AM - 9:00 PM",
            wednesday: "10:00 AM - 9:00 PM",
            thursday: "10:00 AM - 9:00 PM",
            friday: "10:00 AM - 10:00 PM",
            saturday: "10:00 AM - 10:00 PM",
            sunday: "12:00 PM - 8:00 PM"
          }
        },
        {
          id: "store_6",
          name: "NBA Thread - Boston",
          type: "Flagship",
          address: "2468 Newbury Street",
          city: "Boston",
          state: "MA",
          zip: "02116",
          phone: "(617) 555-0987",
          employees: 22,
          rating: 4.7,
          featured: false,
          hours: {
            monday: "10:00 AM - 8:00 PM",
            tuesday: "10:00 AM - 8:00 PM",
            wednesday: "10:00 AM - 8:00 PM",
            thursday: "10:00 AM - 8:00 PM",
            friday: "10:00 AM - 9:00 PM",
            saturday: "9:00 AM - 9:00 PM",
            sunday: "11:00 AM - 7:00 PM"
          }
        }
      ];

      // Save sample data for future use
      const storesObject = {};
      sampleStores.forEach(store => {
        storesObject[store.id] = store;
      });
      await persist.writeJSON('stores.json', storesObject);

      res.json(sampleStores);
    }
  });

// POST /stores/search - Search stores by location
router.post('/stores/search', async (req, res) => {
  try {
    const { location, radius } = req.body;

    if (!location) {
      return res.status(400).send('Location is required');
    }

    // Get all stores
    const stores = await persist.readJSON('stores.json');
    const storesArray = Object.values(stores);

    // Simple location matching (in real app, you'd use geocoding API)
    const searchResults = storesArray.filter(store => {
      const locationLower = location.toLowerCase();
      return (
        store.city.toLowerCase().includes(locationLower) ||
        store.state.toLowerCase().includes(locationLower) ||
        store.zip.includes(location) ||
        store.address.toLowerCase().includes(locationLower)
      );
    });

    // Simulate distance calculation (in real app, you'd calculate actual distances)
    const resultsWithDistance = searchResults.map(store => ({
      ...store,
      distance: Math.random() * parseInt(radius) // Simulate distance within radius
    }));

    // Sort by distance
    resultsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(resultsWithDistance);
  } catch (error) {
    console.error('Error searching stores:', error);
    res.status(500).send('Failed to search stores');
  }
});

// POST /stores/nearby - Find stores near coordinates
router.post('/stores/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).send('Latitude and longitude are required');
    }

    // Get all stores
    const stores = await persist.readJSON('stores.json');
    const storesArray = Object.values(stores);

    // Simulate finding nearby stores (in real app, you'd use geolocation calculations)
    const nearbyStores = storesArray.map(store => ({
      ...store,
      distance: Math.random() * parseInt(radius || 25) // Simulate distance
    }));

    // Sort by distance and filter by radius
    const filteredStores = nearbyStores
      .filter(store => store.distance <= parseInt(radius || 25))
      .sort((a, b) => a.distance - b.distance);

    res.json(filteredStores);
  } catch (error) {
    console.error('Error finding nearby stores:', error);
    res.status(500).send('Failed to find nearby stores');
  }
});

// GET /stores/:id - Get specific store details
router.get('/stores/:id', async (req, res) => {
  try {
    const storeId = req.params.id;
    const stores = await persist.readJSON('stores.json');
    
    const store = stores[storeId];
    if (!store) {
      return res.status(404).send('Store not found');
    }

    // Add additional details
    const storeDetails = {
      ...store,
      inventory: Math.floor(Math.random() * 500) + 200, // Simulate inventory count
      services: [
        'Custom jersey printing',
        'Size exchanges',
        'Gift wrapping',
        'Personal shopping assistance'
      ],
      specialties: [
        'Vintage jerseys',
        'Autographed merchandise',
        'Limited edition items',
        'Team accessories'
      ],
      parking: 'Free parking available',
      accessibility: 'Wheelchair accessible',
      lastUpdated: new Date().toISOString()
    };

    res.json(storeDetails);
  } catch (error) {
    console.error('Error loading store details:', error);
    res.status(500).send('Failed to load store details');
  }
});

// POST /stores - Add new store (admin only)
router.post('/stores', async (req, res) => {
  const username = req.cookies.username;
  if (username !== 'admin') {
    return res.status(403).send('Admin access required');
  }

  try {
    const storeData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'address', 'city', 'state', 'zip', 'phone'];
    for (const field of requiredFields) {
      if (!storeData[field]) {
        return res.status(400).send(`${field} is required`);
      }
    }

    const stores = await persist.readJSON('stores.json');
    const storeId = `store_${Date.now()}`;
    
    const newStore = {
      id: storeId,
      ...storeData,
      employees: parseInt(storeData.employees) || 10,
      rating: parseFloat(storeData.rating) || 4.0,
      featured: Boolean(storeData.featured),
      createdAt: new Date().toISOString()
    };

    stores[storeId] = newStore;
    await persist.writeJSON('stores.json', stores);

    // Log activity
    await persist.appendActivity({ username, type: 'store-add' });

    res.json(newStore);
  } catch (error) {
    console.error('Error adding store:', error);
    res.status(500).send('Failed to add store');
  }
});

// PUT /stores/:id - Update store (admin only)
router.put('/stores/:id', async (req, res) => {
  const username = req.cookies.username;
  if (username !== 'admin') {
    return res.status(403).send('Admin access required');
  }

  try {
    const storeId = req.params.id;
    const updates = req.body;
    
    const stores = await persist.readJSON('stores.json');
    
    if (!stores[storeId]) {
      return res.status(404).send('Store not found');
    }

    // Update store data
    stores[storeId] = {
      ...stores[storeId],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await persist.writeJSON('stores.json', stores);

    // Log activity
    await persist.appendActivity({ username, type: 'store-update' });

    res.json(stores[storeId]);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).send('Failed to update store');
  }
});

// DELETE /stores/:id - Delete store (admin only)
router.delete('/stores/:id', async (req, res) => {
  const username = req.cookies.username;
  if (username !== 'admin') {
    return res.status(403).send('Admin access required');
  }

  try {
    const storeId = req.params.id;
    const stores = await persist.readJSON('stores.json');
    
    if (!stores[storeId]) {
      return res.status(404).send('Store not found');
    }

    const deletedStore = stores[storeId];
    delete stores[storeId];
    
    await persist.writeJSON('stores.json', stores);

    // Log activity
    await persist.appendActivity({ username, type: 'store-delete' });

    res.json({ 
      message: 'Store deleted successfully',
      deletedStore 
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).send('Failed to delete store');
  }
});

module.exports = router;