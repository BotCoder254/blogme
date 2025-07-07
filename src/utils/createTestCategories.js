import Parse from '../services/parseConfig';

// Function to create test categories
const createTestCategories = async () => {
  const testCategories = [
    'Technology',
    'Health',
    'Travel',
    'Food',
    'Lifestyle',
    'Business',
    'Sports',
    'Education',
    'Entertainment',
    'Science'
  ];
  
  const Category = Parse.Object.extend('Category');
  
  try {
    // First check if categories already exist
    const query = new Parse.Query(Category);
    const existingCategories = await query.find();
    
    if (existingCategories.length > 0) {
      console.log(`${existingCategories.length} categories already exist.`);
      return existingCategories;
    }
    
    // If no categories exist, create them
    const categoryObjects = testCategories.map(name => {
      const category = new Category();
      category.set('name', name);
      return category;
    });
    
    const savedCategories = await Parse.Object.saveAll(categoryObjects);
    console.log(`Created ${savedCategories.length} test categories.`);
    return savedCategories;
  } catch (error) {
    console.error('Error creating test categories:', error);
    throw error;
  }
};

export default createTestCategories; 