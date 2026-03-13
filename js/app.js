// Main entry point for the app
// This file starts the app and loads the correct page

// Set up initial data in localStorage if not already present
initializeData();

// Wait until the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
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
