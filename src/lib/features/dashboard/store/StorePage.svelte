<!-- src/lib/features/dashboard/pages/store/StorePage.svelte -->

<script lang="ts">
  import { getUser } from '$lib/services/firebase/auth.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ShoppingCart, Tag, FileText } from '@lucide/svelte';
  
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
      thumbnailUrl: '/templates/landing-bundle.png',
      popular: true
    },
    {
      id: 'email-templates',
      name: 'Email Campaign Pack',
      description: 'Professional email templates for onboarding, newsletters, and marketing campaigns.',
      price: 29,
      category: 'Email',
      tags: ['Email', 'Campaigns', 'Marketing'],
      thumbnailUrl: '/templates/email-pack.png',
      popular: false
    },
    {
      id: 'feature-pages',
      name: 'Feature Page Collection',
      description: 'Showcase your product features with these professionally designed templates.',
      price: 19,
      category: 'Website',
      tags: ['Features', 'Product', 'UI Components'],
      thumbnailUrl: '/templates/features.png',
      popular: false
    },
    {
      id: 'pricing-tables',
      name: 'Pricing Table Templates',
      description: 'Convert more customers with these optimized pricing table designs.',
      price: 19,
      category: 'Website',
      tags: ['Pricing', 'Conversion', 'Tables'],
      thumbnailUrl: '/templates/pricing.png',
      popular: true
    },
    {
      id: 'blog-templates',
      name: 'Blog Layout Pack',
      description: 'Professional blog layouts with optimized typography and readability.',
      price: 29,
      category: 'Content',
      tags: ['Blog', 'Content', 'SEO'],
      thumbnailUrl: '/templates/blog.png',
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
      thumbnailUrl: '/templates/bundle.png',
      popular: true,
      featured: true
    }
  ];
  
  // Categories for filtering
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
      ? templates 
      : templates.filter(t => t.category.toLowerCase() === activeCategory.toLowerCase())
  );
  
  // Add to cart handler (placeholder)
  function addToCart(templateId) {
    console.log('Adding template to cart:', templateId);
    // Implement cart functionality
  }
</script>

<div>
  <header class="mb-8">
    <h1 class="text-3xl font-bold tracking-tight">Template Store</h1>
    <p class="text-muted-foreground mt-1">Professional templates to supercharge your writing workflow.</p>
  </header>
  
  <!-- Category Navigation -->
  <div class="flex flex-wrap gap-2 mb-8">
    {#each categories as category}
      <Button 
        variant={activeCategory === category.id ? "default" : "outline"}
        size="sm"
        onclick={() => activeCategory = category.id}
      >
        {category.name}
      </Button>
    {/each}
  </div>
  
  <!-- Featured Template (if any) -->
  {#if templates.find(t => t.featured)}
    {@const featuredTemplate = templates.find(t => t.featured)}
    <div class="mb-8">
      <Card.Root class="overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div class="md:col-span-1 bg-muted/50 flex items-center justify-center p-8">
            <div class="rounded-md overflow-hidden h-48 w-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <FileText class="h-16 w-16 text-muted-foreground/40" />
            </div>
          </div>
          <div class="md:col-span-2 p-6">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-bold">{featuredTemplate.name}</h2>
                <div class="flex items-center mt-1 gap-2">
                  <Badge variant="secondary">{featuredTemplate.category}</Badge>
                  <Badge variant="outline" class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">Featured</Badge>
                </div>
              </div>
              <div class="text-right">
                {#if featuredTemplate.originalPrice}
                  <div class="text-sm text-muted-foreground line-through">${featuredTemplate.originalPrice}</div>
                {/if}
                <div class="text-2xl font-bold">${featuredTemplate.price}</div>
              </div>
            </div>
            <p class="mt-4 text-muted-foreground">{featuredTemplate.description}</p>
            <div class="mt-6">
              <div class="flex flex-wrap gap-2 mb-4">
                {#each featuredTemplate.tags as tag}
                  <div class="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">{tag}</div>
                {/each}
              </div>
              <Button class="w-full md:w-auto gap-2" onclick={() => addToCart(featuredTemplate.id)}>
                <ShoppingCart class="h-4 w-4" />
                <span>Add to Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </Card.Root>
    </div>
  {/if}
  
  <!-- Template Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each filteredTemplates.filter(t => !t.featured) as template}
      <Card.Root>
        <Card.Header class="pb-4">
          <div class="rounded-md overflow-hidden h-36 bg-gray-200 dark:bg-gray-800 flex items-center justify-center -mt-2 -mx-6 mb-4">
            <FileText class="h-12 w-12 text-muted-foreground/40" />
          </div>
          <div class="flex justify-between items-start">
            <div>
              <Card.Title>{template.name}</Card.Title>
              <div class="flex items-center mt-1 gap-2">
                <Badge variant="secondary">{template.category}</Badge>
                {#if template.popular}
                  <Badge variant="outline" class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">Popular</Badge>
                {/if}
              </div>
            </div>
            <div class="text-right">
              {#if template.originalPrice}
                <div class="text-xs text-muted-foreground line-through">${template.originalPrice}</div>
              {/if}
              <div class="text-lg font-bold">${template.price}</div>
            </div>
          </div>
        </Card.Header>
        <Card.Content class="pb-2">
          <p class="text-sm text-muted-foreground">{template.description}</p>
          <div class="flex flex-wrap gap-1 mt-4">
            {#each template.tags as tag}
              <div class="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{tag}</div>
            {/each}
          </div>
        </Card.Content>
        <Card.Footer>
          <Button variant="outline" size="sm" class="w-full" onclick={() => addToCart(template.id)}>
            <ShoppingCart class="h-4 w-4 mr-2" />
            <span>Add to Cart</span>
          </Button>
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>
</div>