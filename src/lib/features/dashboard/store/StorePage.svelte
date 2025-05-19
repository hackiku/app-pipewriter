<!-- src/lib/features/dashboard/store/StorePage.svelte -->

<script lang="ts">
  import { getUser } from '$lib/services/firebase/auth.svelte';
  import FeaturedTemplate from './FeaturedTemplate.svelte';
  import CategoryFilter from './CategoryFilter.svelte';
  import TemplateGrid from './TemplateGrid.svelte';
  
  // State
  let loading = $state(false);
  let user = $state(getUser());
  
  // Template data
  const templates = [
    {
      id: 'landing-page-bundle',
      name: 'Landing Page Bundle',
      description: 'Complete landing page templates with hero, features, pricing, and footer sections.',
      price: 49,
      category: 'Website',
      tags: ['Landing Page', 'Conversion', 'SaaS'],
      thumbnailUrl: '/sample/landing-page.jpg',
      popular: true
    },
    {
      id: 'email-templates',
      name: 'Email Campaign Pack',
      description: 'Professional email templates for onboarding, newsletters, and marketing campaigns.',
      price: 29,
      category: 'Email',
      tags: ['Email', 'Campaigns', 'Marketing'],
      thumbnailUrl: '/sample/email.jpg',
      popular: false
    },
    {
      id: 'feature-pages',
      name: 'Feature Page Collection',
      description: 'Showcase your product features with these professionally designed templates.',
      price: 19,
      category: 'Website',
      tags: ['Features', 'Product', 'UI Components'],
      thumbnailUrl: '/sample/features.jpg',
      popular: false
    },
    {
      id: 'pricing-tables',
      name: 'Pricing Table Templates',
      description: 'Convert more customers with these optimized pricing table designs.',
      price: 19,
      category: 'Website',
      tags: ['Pricing', 'Conversion', 'Tables'],
      thumbnailUrl: '/sample/pricing.jpg',
      popular: true
    },
    {
      id: 'blog-templates',
      name: 'Blog Layout Pack',
      description: 'Professional blog layouts with optimized typography and readability.',
      price: 29,
      category: 'Content',
      tags: ['Blog', 'Content', 'SEO'],
      thumbnailUrl: '/sample/blog.jpg',
      popular: false
    },
    {
      id: 'complete-bundle',
      name: 'Complete Template Bundle',
      description: 'Get all templates at a discounted price. Includes future templates for 1 year.',
      price: 99,
      originalPrice: 145,
      category: 'Bundle',
      tags: ['Bundle', 'Value', 'Complete'],
      thumbnailUrl: '/sample/bundle.jpg',
      popular: true,
      featured: true
    }
  ];
  
  // Categories
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'website', name: 'Website' },
    { id: 'email', name: 'Email' },
    { id: 'content', name: 'Content' },
    { id: 'bundle', name: 'Bundles' }
  ];
  
  // Active category
  let activeCategory = $state('all');
  
  // Filtered templates
  let filteredTemplates = $derived(
    activeCategory === 'all' 
      ? templates.filter(t => !t.featured) 
      : templates.filter(t => !t.featured && t.category.toLowerCase() === activeCategory.toLowerCase())
  );
  
  // Featured template
  let featuredTemplate = $derived(templates.find(t => t.featured));
  
  // Category change handler
  function handleCategoryChange(category) {
    activeCategory = category;
  }
  
  // Purchase handler (placeholder)
  function handlePurchase(templateId) {
    console.log('Purchasing template:', templateId);
    // To be connected to payment processing
  }
</script>

<div>
  <header class="mb-10">
    <h1 class="text-4xl font-bold tracking-tight mb-3">Template Store</h1>
    <p class="text-muted-foreground max-w-2xl text-lg">
      Professional templates to supercharge your writing workflow. Create compelling documents in a fraction of the time.
    </p>
  </header>
  
  <!-- Category Filters -->
  <CategoryFilter 
    categories={categories} 
    activeCategory={activeCategory}
    onCategoryChange={handleCategoryChange}
  />
  
  <!-- Featured Template (if any) -->
  {#if featuredTemplate}
    <div class="mb-12 mt-8">
      <FeaturedTemplate 
        template={featuredTemplate} 
        onPurchase={handlePurchase} 
      />
    </div>
  {/if}
  
  <!-- Template Grid -->
  <TemplateGrid 
    templates={filteredTemplates} 
    onPurchase={handlePurchase} 
  />
</div>