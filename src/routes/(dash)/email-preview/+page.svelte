<!-- src/routes/(dash)/email-preview/+page.svelte - EMAIL PREVIEW INTERFACE -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Select from '$lib/components/ui/select';
  import * as Card from '$lib/components/ui/card';
  import * as Tabs from '$lib/components/ui/tabs';

  // State
  let templates: any[] = $state([]);
  let selectedTemplate: any = $state(null);
  let variables: Record<string, string> = $state({});
  let emailPreview: any = $state(null);
  let loading = $state(false);
  let testEmail = $state('');
  let testLoading = $state(false);

  // Load templates on mount
  onMount(async () => {
    await loadTemplates();
  });

  async function loadTemplates() {
    try {
      loading = true;
      const response = await fetch('/api/email/preview');
      const data = await response.json();
      
      if (data.success) {
        templates = data.templates;
        console.log('📧 Loaded templates:', templates);
      } else {
        console.error('Failed to load templates:', data.message);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      loading = false;
    }
  }

  async function previewTemplate() {
    if (!selectedTemplate) return;

    try {
      loading = true;
      const response = await fetch('/api/email/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          variables,
          format: 'both'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        emailPreview = data;
        console.log('📧 Preview generated:', data);
      } else {
        console.error('Failed to generate preview:', data.message);
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      loading = false;
    }
  }

  async function sendTestEmail(type: 'single' | 'sequence') {
    if (!selectedTemplate && type === 'single') return;

    try {
      testLoading = true;
      const body: any = {
        type,
        email: testEmail || undefined,
        variables
      };

      if (type === 'single') {
        body.templateId = selectedTemplate.id;
      } else {
        body.sequenceId = 'welcome-sequence';
        body.delaySeconds = 5;
      }

      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        console.log('📧 Test email sent:', data);
      } else {
        alert(`❌ ${data.message}`);
        console.error('Test email failed:', data);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('❌ Error sending test email');
    } finally {
      testLoading = false;
    }
  }

  function selectTemplate(template: any) {
    selectedTemplate = template;
    
    // Initialize variables with template defaults
    variables = {};
    if (template.variables) {
      template.variables.forEach((varName: string) => {
        variables[varName] = '';
      });
    }
    
    // Auto-preview when template selected
    previewTemplate();
  }

  // Re-preview when variables change (with debounce)
  $effect(() => {
    if (selectedTemplate && Object.keys(variables).length > 0) {
      const timeoutId = setTimeout(() => {
        previewTemplate();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  });
</script>

<div class="container mx-auto p-6 max-w-7xl">
  <div class="mb-6">
    <h1 class="text-3xl font-bold mb-2">📧 Email Preview & Testing</h1>
    <p class="text-muted-foreground">Preview and test email templates from Firebase</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Template Selection -->
    <div class="lg:col-span-1">
      <Card.Root>
        <Card.Header>
          <Card.Title>Templates</Card.Title>
          <Card.Description>
            {loading ? 'Loading...' : `${templates.length} templates available`}
          </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          {#if loading}
            <div class="text-center py-4">Loading templates...</div>
          {:else if templates.length === 0}
            <div class="text-center py-4 text-muted-foreground">
              No templates found. Run email seeding script first.
            </div>
          {:else}
            {#each templates as template}
              <div 
                class="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors {selectedTemplate?.id === template.id ? 'border-primary bg-accent' : ''}"
                on:click={() => selectTemplate(template)}
              >
                <div class="font-medium">{template.name}</div>
                <div class="text-sm text-muted-foreground">{template.subject}</div>
                <div class="text-xs text-muted-foreground mt-1">
                  {template.category} • {template.estimatedReadTime}
                </div>
                {#if template.variables && template.variables.length > 0}
                  <div class="text-xs text-blue-600 mt-1">
                    Variables: {template.variables.join(', ')}
                  </div>
                {/if}
              </div>
            {/each}
          {/if}
        </Card.Content>
      </Card.Root>

      <!-- Variables & Testing -->
      {#if selectedTemplate}
        <Card.Root class="mt-6">
          <Card.Header>
            <Card.Title>Variables & Testing</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <!-- Variables -->
            {#if selectedTemplate.variables && selectedTemplate.variables.length > 0}
              <div>
                <Label class="text-sm font-medium">Template Variables</Label>
                <div class="space-y-2 mt-2">
                  {#each selectedTemplate.variables as varName}
                    <div>
                      <Label for={varName} class="text-xs">{varName}</Label>
                      <Input
                        id={varName}
                        bind:value={variables[varName]}
                        placeholder={varName === 'email' ? 'test@example.com' : varName === 'name' ? 'Test User' : `Enter ${varName}`}
                        class="text-sm"
                      />
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Test Email -->
            <div>
              <Label for="testEmail" class="text-sm">Test Email Address</Label>
              <Input
                id="testEmail"
                bind:value={testEmail}
                placeholder="Leave empty to use your email"
                type="email"
                class="text-sm"
              />
            </div>

            <!-- Test Buttons -->
            <div class="space-y-2">
              <Button
                on:click={() => sendTestEmail('single')}
                disabled={testLoading}
                class="w-full"
                size="sm"
              >
                {testLoading ? 'Sending...' : 'Send Test Email'}
              </Button>
              
              <Button
                on:click={() => sendTestEmail('sequence')}
                disabled={testLoading}
                variant="outline"
                class="w-full"
                size="sm"
              >
                {testLoading ? 'Sending...' : 'Send Welcome Sequence (5s delays)'}
              </Button>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}
    </div>

    <!-- Email Preview -->
    <div class="lg:col-span-2">
      {#if emailPreview}
        <Card.Root>
          <Card.Header>
            <Card.Title>Email Preview: {selectedTemplate?.name}</Card.Title>
            <Card.Description>Subject: {emailPreview.subject}</Card.Description>
          </Card.Header>
          <Card.Content>
            <Tabs.Root value="html" class="w-full">
              <Tabs.List class="grid w-full grid-cols-2">
                <Tabs.Trigger value="html">HTML Preview</Tabs.Trigger>
                <Tabs.Trigger value="text">Text Version</Tabs.Trigger>
              </Tabs.List>
              
              <Tabs.Content value="html" class="mt-4">
                <div class="border rounded-lg p-4 bg-white">
                  <!-- Preview Text -->
                  {#if emailPreview.previewText}
                    <div class="text-xs text-gray-500 mb-4 p-2 bg-gray-50 border-l-4 border-blue-500">
                      <strong>Preview Text:</strong> {emailPreview.previewText}
                    </div>
                  {/if}
                  
                  <!-- HTML Content -->
                  <div class="email-preview">
                    {@html emailPreview.html}
                  </div>
                </div>
              </Tabs.Content>
              
              <Tabs.Content value="text" class="mt-4">
                <div class="border rounded-lg p-4 bg-gray-50">
                  <pre class="whitespace-pre-wrap text-sm font-mono">{emailPreview.text}</pre>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </Card.Content>
        </Card.Root>
      {:else if selectedTemplate}
        <Card.Root>
          <Card.Content class="flex items-center justify-center h-64">
            <div class="text-center text-muted-foreground">
              {loading ? 'Generating preview...' : 'Select a template and adjust variables to see preview'}
            </div>
          </Card.Content>
        </Card.Root>
      {:else}
        <Card.Root>
          <Card.Content class="flex items-center justify-center h-64">
            <div class="text-center text-muted-foreground">
              Select a template from the sidebar to preview
            </div>
          </Card.Content>
        </Card.Root>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Email preview styling */
  :global(.email-preview) {
    max-width: 100%;
    overflow-x: auto;
  }
  
  :global(.email-preview table) {
    margin: 0 auto;
  }
  
  :global(.email-preview img) {
    max-width: 100%;
    height: auto;
  }
</style>