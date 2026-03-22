// Main entry point for the app
// This file starts the app and loads the correct page

// Wait until the page is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  await initializeData();

  bindPageTransitions();

  // Apply the saved theme (dark/light)
  applySavedTheme();
  // Set up global event listeners (like theme toggle)
  bindGlobalEvents();
  // Show notifications if any
  renderNotifications();

  // Get which page to show from the HTML
  const page = document.body.dataset.page;

  // Show the correct page based on the value
  if (page === 'dashboard') renderDashboardPage();
  if (page === 'expenses') renderExpensesPage();
  if (page === 'categories') renderCategoriesPage();
  if (page === 'budget') renderBudgetPage();
  if (page === 'report') renderReportPage();
});
