// Script to force refresh workload data
(function() {
    console.log('🔄 Force refreshing workload data...');
    
    // Clear localStorage
    localStorage.removeItem('deleted_jadwal_ids');
    localStorage.removeItem('workload_cache');
    console.log('✅ Cleared localStorage');
    
    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ Cleared sessionStorage');
    
    // Force refresh the page with cache bypass
    window.location.reload(true);
})();
