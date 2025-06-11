<!-- Template for: src/routes/(dash)/dashboard/projects/+page.svelte, templates/+page.svelte, store/+page.svelte, etc. -->
<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ArrowLeft, ExternalLink, Construction, FileText, Palette, ShoppingCart } from 'lucide-svelte';
  import { page } from '$app/stores';
  
  // Get the current route to customize content
  let currentRoute = $derived($page.url.pathname.split('/').pop() || 'page');
  
  // Route-specific content
  const routeConfig = {
    projects: {
      title: 'Projects',
      description: 'Manage your document projects and collaborations',
      icon: FileText,
      features: [
        'Project templates and organization',
        'Collaboration with team members', 
        'Version history and backups',
        'Integration with Google Workspace'
      ]
    },
    templates: {
      title: 'Templates',
      description: 'Browse and customize document templates',
      icon: Palette,
      features: [
        'Professional document templates',
        'Custom template creation',
        'Template sharing and marketplace',
        'Category-based organization'
      ]
    },
    store: {
      title: 'Store',
      description: 'Upgrade your account and purchase premium features',
      icon: ShoppingCart,
      features: [
        'Premium template collections',
        'Advanced AI features',
        'Team collaboration tools',
        'Priority customer support'
      ]
    },
    settings: {
      title: 'Settings',
      description: 'Manage your account and preferences',
      icon: Construction,
      features: [
        'Account and billing management',
        'Integration preferences',
        'Notification settings',
        'Data export and privacy controls'
      ]
    }
  };
  
  let config = $derived(routeConfig[currentRoute] || {
    title: currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1),
    description: `Manage your ${currentRoute} settings and preferences`,
    icon: Construction,
    features: ['Feature planning in progress', 'Coming soon to Pipewriter']
  });
  
  function goBack() {
    window.history.back();
  }
  
  function goToDashboard() {
    window.location.href = '/dashboard';
  }
  
  function openGoogleDocs() {
    window.open('https://docs.google.com/document/', '_blank');
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <Button variant="ghost" size="icon" onclick={goBack}>
      <ArrowLeft class="h-4 w-4" />
    </Button>
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <config.icon class="h-5 w-5 text-primary" />
        <h1 class="text-2xl font-bold tracking-tight">{config.title}</h1>
        <Badge variant="secondary" class="text-xs">Coming Soon</Badge>
      </div>
      <p class="text-muted-foreground">{config.description}</p>
    </div>
  </div>

  <!-- Main Content -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Coming Soon Card -->
    <Card class="border-2 border-dashed border-primary/20">
      <CardHeader>
        <div class="flex items-center gap-2">
          <Construction class="h-5 w-5 text-primary" />
          <CardTitle>Under Development</CardTitle>
        </div>
        <CardDescription>
          We're working hard to bring you this feature. Here's what's planned:
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <ul class="space-y-2">
          {#each config.features as feature}
            <li class="flex items-start gap-2">
              <div class="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span class="text-sm text-muted-foreground">{feature}</span>
            </li>
          {/each}
        </ul>
        
        <div class="pt-4 border-t">
          <p class="text-xs text-muted-foreground">
            Want to be notified when this feature launches? 
            <a href="mailto:support@pipewriter.io" class="text-primary hover:underline">
              Let us know!
            </a>
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- What You Can Do Now -->
    <Card>
      <CardHeader>
        <CardTitle>What You Can Do Now</CardTitle>
        <CardDescription>
          While we're building this feature, here's how you can get started with Pipewriter:
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3">
          <Button onclick={openGoogleDocs} variant="outline" class="w-full justify-start gap-2">
            <ExternalLink class="h-4 w-4" />
            Use the Google Docs Add-on
          </Button>
          
          <Button onclick={goToDashboard} variant="outline" class="w-full justify-start gap-2">
            <ArrowLeft class="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>

        <div class="pt-4 border-t space-y-2">
          <h4 class="text-sm font-medium">Current Features Available:</h4>
          <ul class="space-y-1 text-xs text-muted-foreground">
            <li>• Beautiful content elements in Google Docs</li>
            <li>• AI-powered content generation</li>
            <li>• Professional document templates</li>
            <li>• Real-time collaboration tools</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Feedback Section -->
  <Card class="bg-muted/30">
    <CardHeader>
      <CardTitle class="text-lg">Help Shape This Feature</CardTitle>
      <CardDescription>
        Your feedback helps us prioritize development and build features you actually need.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          onclick={() => window.open('mailto:support@pipewriter.io?subject=Feature Request: ' + config.title, '_blank')}
          class="gap-2"
        >
          <ExternalLink class="h-4 w-4" />
          Send Feedback
        </Button>
        
        <Button 
          variant="outline" 
          onclick={() => window.open('https://pipewriter.io', '_blank')}
          class="gap-2"
        >
          <ExternalLink class="h-4 w-4" />
          Visit Main Website
        </Button>
      </div>
    </CardContent>
  </Card>
</div>