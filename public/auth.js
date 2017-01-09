firebase.auth().onAuthStateChanged(function(user) {
  window.user = user;
  if (user) {
    database.ref().once("value").catch(error => {
      alert('Det gick inte att läsa från databasen. Är du säker på att du är inloggad med rätt google-konto?');
    });
  } else {
    // No user is signed in.
    signIn();
  }
});


function signIn() {
  
  var provider = new firebase.auth.GoogleAuthProvider();
  
  firebase.auth().signInWithRedirect(provider);
}