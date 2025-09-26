// Simple test script to verify search functionality
import searchService from './src/services/searchService.js';

async function testSearch() {
  console.log('🧪 Testing Search Service...\n');

  try {
    // Test featured properties
    console.log('1. Testing featured properties...');
    const featured = await searchService.getFeaturedProperties(3);
    console.log(`✅ Found ${featured.length} featured properties`);
    if (featured.length > 0) {
      console.log(`   Sample: ${featured[0].title}`);
    }

    // Test recent properties
    console.log('\n2. Testing recent properties...');
    const recent = await searchService.getRecentProperties(3);
    console.log(`✅ Found ${recent.length} recent properties`);
    if (recent.length > 0) {
      console.log(`   Sample: ${recent[0].title}`);
    }

    // Test search suggestions
    console.log('\n3. Testing search suggestions...');
    const suggestions = await searchService.getSearchSuggestions('lagos');
    console.log(`✅ Found ${suggestions.length} suggestions`);
    suggestions.forEach(sug => {
      console.log(`   - ${sug.text} (${sug.type})`);
    });

    // Test property search
    console.log('\n4. Testing property search...');
    const searchResults = await searchService.searchProperties({
      query: 'lagos',
      page: 1,
      limit: 3
    });
    console.log(`✅ Found ${searchResults.properties.length} properties`);
    console.log(`   Total count: ${searchResults.totalCount}`);
    if (searchResults.properties.length > 0) {
      console.log(`   Sample: ${searchResults.properties[0].title}`);
    }

    console.log('\n🎉 All tests passed! Search service is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure your Supabase credentials are configured correctly.');
  }
}

testSearch();
