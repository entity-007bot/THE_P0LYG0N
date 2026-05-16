// backend/controllers/ussdController.js

export const handleUSSD = async (req, res) => {
    // AT sends: sessionId, serviceCode, phoneNumber, text
    const { text } = req.body;
    
    // Split the text by '*' to handle multi-level menus
    const steps = text ? text.split('*') : [];
    let response = '';

    // Logic: If steps array is empty, show the main menu
    if (steps.length === 0 || text === '') {
        response = `CON Welcome to SquadFlow AI
1. Onboard worker
2. Check wallet
3. Find gigs`;
    } 
    
    // --- Option 1: Onboarding ---
    else if (steps[0] === '1') {
        response = `END Demo onboarding request received. A SquadFlow agent will complete KYC and virtual-account setup.`;
    } 
    
    // --- Option 2: Wallet ---
    else if (steps[0] === '2') {
        response = `END Wallet, Growth Vault, and KiScore are available in the app dashboard.`;
    } 
    
    // --- Option 3: Find Gigs (Multi-step) ---
    else if (steps[0] === '3') {
        if (steps.length === 1) {
            // User just pressed '3'
            response = 'CON Enter your skill (e.g. Plumber):';
        } 
        else if (steps.length === 2) {
            // User entered a skill: steps[1] is the skill name
            const skill = steps[1];
            // You can use the 'skill' variable here to query your local SQLite DB
            response = `CON Found: Electrician @ Otuoke campus (5k).
1. Accept
2. Back`;
        } 
        else if (steps.length === 3 && steps[2] === '1') {
            // User selected '1' to accept
            response = 'END Job Accepted! You will receive an SMS with the location details.';
        } 
        else {
            // Fallback for invalid input within the Gigs submenu
            response = 'END Invalid selection. Returning to main menu.';
        }
    } 
    
    // --- Fallback for invalid main menu selection ---
    else {
        response = `END Invalid selection. Please try again.`;
    }

    // Set header and send response
    res.set('Content-Type', 'text/plain');
    res.send(response);
};
