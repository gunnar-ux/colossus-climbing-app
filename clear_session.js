
// Clear all browser data
localStorage.clear();
sessionStorage.clear();
console.log('✅ All browser storage cleared');

// Clear Supabase session
import('./src/lib/supabase.js').then(({ supabase }) => {
  if (supabase) {
    supabase.auth.signOut().then(() => {
      console.log('✅ Supabase session cleared');
      window.location.href = '/';
    });
  }
});

