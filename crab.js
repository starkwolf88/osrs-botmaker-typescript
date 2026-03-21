var usingDharoks = null;
var useRanged = null;
var useOffensivePrayer = null;
var lootAmmo = null;
var ammoID = 0;
var errors = [];
var CONFIG_SET = false;
var timeout = 0;
var state = null;
var supplyTimeout = 0;
var attackNPCTimeout = 0;
var prayerPotIDs = [143, 141, 139, 2434, 3030, 3028, 3026, 3024, 29195, 29213, 28893];
var foodIDs = [333, 351, 329, 361, 379, 365, 373, 6703, 6705, 7946, 3144, 385, 397, 391, 7060, 11936, 13441];
var crabsLocation1 = new net.runelite.api.coords.WorldPoint(1275, 3170, 0);
var crabsLocation2 = new net.runelite.api.coords.WorldPoint(1243, 3041, 0);
var crabsLocation3 = new net.runelite.api.coords.WorldPoint(1352, 3115, 0);
var ammoIDs = [];

function onStart() {
    var imports = new JavaImporter(
        javax.swing,
        java.awt,
        java.awt.event
    );
    
    with (imports) {
       
        var frame = new JFrame('Gemstone Crab v1.01');
        frame.setSize(800, 450);
        frame.setResizable(true);
        frame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        
        var mainPanel = new JPanel(new GridLayout(0, 1));
        mainPanel.setBackground(Color.BLACK);
        var subPanel = new JPanel(new GridLayout(0, 1));
        subPanel.setBackground(Color.BLACK);
 
        var mainConfiguration = new JPanel(new GridLayout(0, 1));
        mainConfiguration.setBackground(Color.BLACK);
        mainConfiguration.setBorder(BorderFactory.createTitledBorder(""));
 
        var infomationLabel = new JLabel('<html><left><font color="Green">Welcome to Gemstone Crab.<br>Start geared and at an active Gemstone Crab location.<br>The script will use Boost Potions, etc, if available.</font></left></html>');
        infomationLabel.setForeground(Color.WHITE);
     
        var defaultMeleeStyle = bot.bmCache.getBoolean('defaultMeleeStyle', true);
        var defaultMeleeStyleCheckbox = new JCheckBox('<html><font color="Red">Using Melee?</font></html>');
        defaultMeleeStyleCheckbox.setForeground(Color.WHITE);
        defaultMeleeStyleCheckbox.setSelected(defaultMeleeStyle);

        var defaultDharoks = bot.bmCache.getBoolean('defaultDharoks', false);
        var defaultDharoksCheckbox = new JCheckBox('<html><font color="Red">-- Using Dharoks? (requires Rock Cake/Loc Orb)</font></html>');
        defaultDharoksCheckbox.setForeground(Color.WHITE);
        defaultDharoksCheckbox.setSelected(defaultDharoks);
 
        var defaultRangedStyle = bot.bmCache.getBoolean('defaultRangedStyle', false);
        var defaultRangedStyleCheckbox = new JCheckBox('<html><font color="Red">Using Ranged?</font></html>');
        defaultRangedStyleCheckbox.setForeground(Color.WHITE);
        defaultRangedStyleCheckbox.setSelected(defaultRangedStyle);
 
        var styleGroup = [defaultMeleeStyleCheckbox, defaultRangedStyleCheckbox];
        styleGroup.forEach(function (checkbox) {
            checkbox.addItemListener({
                itemStateChanged: function (event) {
                    if (event.getStateChange() == ItemEvent.SELECTED) {
                     styleGroup.forEach(function (otherCheckbox) {
                            if (otherCheckbox !== checkbox) {
                                otherCheckbox.setSelected(false);
                            }
                        });
                    }
                }
            });
        });
 
        var defaultOffensivePrayer = bot.bmCache.getBoolean('defaultOffensivePrayer', false);
        var defaultOffensivePrayerCheckbox = new JCheckBox('<html><font color="Yellow">Use Low-tier Offensive Prayer?</font></html>');
        defaultOffensivePrayerCheckbox.setForeground(Color.WHITE);
        defaultOffensivePrayerCheckbox.setSelected(defaultOffensivePrayer);
 
        var defaultLoot = bot.bmCache.getBoolean('defaultLoot', false);
        var defaultLootCheckbox = new JCheckBox('<html><font color="Yellow">Loot Ammo? (when stack is at 20+)</font></html>');
        defaultLootCheckbox.setForeground(Color.WHITE);
        defaultLootCheckbox.setSelected(defaultLoot);
 
        var ammoInfomationLabel = new JLabel('<html><font color="Green">Enter the ID of Ammo you wish to loot.<br>Leave at 0 to disable.</font></html>');
        ammoInfomationLabel.setForeground(Color.WHITE);
 
        var defaultAmmoList = bot.bmCache.getString('defaultAmmoList', '0');
        var ammoTextField = new JTextField(defaultAmmoList);
        ammoTextField.setForeground(Color.WHITE); 
        ammoTextField.setPreferredSize(new Dimension(100, 20));
 
        mainConfiguration.add(infomationLabel);
        mainConfiguration.add(defaultMeleeStyleCheckbox);
        mainConfiguration.add(defaultDharoksCheckbox);
        mainConfiguration.add(defaultRangedStyleCheckbox);
        mainConfiguration.add(defaultOffensivePrayerCheckbox);
        mainConfiguration.add(defaultLootCheckbox);
        mainConfiguration.add(ammoInfomationLabel);
        mainConfiguration.add(ammoTextField);
 
        // Section for TITLE
        var titleConfigPanel = new JPanel(new GridLayout(0, 1));
        titleConfigPanel.setBackground(Color.BLACK);
        titleConfigPanel.setBorder(BorderFactory.createTitledBorder(""));
        
        var welcomeLabel = new JLabel('<html><center><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▓▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒░▒▓▓▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒░░░░░░▒▒▒▓▓▓▓▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▓▒▒░░░▒▒▒▒▓▓▓▓▒▒▒▓▓▓▒░░░░░░░░░░░░░░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▓▓▓▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░▒▒▒░░░░░░░░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░▒▓▒▒░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒░▒▒▒▒▓▒░░░░░░░░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▓▓▓▓▓█▓▓██▓▓▓▓▓▓▒▒░▒▒▒▒░▒▓▓▓▓▓▒░░░▒▒▒░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░▒▓▒▒▓▓▓▒▒▓▓▓▓▓▓▓██▓▓▓▓▓▓▒▒▒▒▒▓▒▒▓▓▓▓▓▓▒▒▒▒▒▒▒░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░▒▓▓▓▓▓▓▓▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▓▓▒▒▓▓▓▓▓▒░▒▒▒▒▓▒░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░▒▓▓▒▓▓▓▓▒▓▓▓▓▓▒▒▓▓▓▓▓▒▒▒▒▒▓▓▓▒▓▓▓▓▓▒▒▒▒▒▒▒▓▒▒░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒▒▓▓▓▓▓▒▒▒▒▒▓▓▒▒▓▓▒▒▓▒▒▒▒▒▓▓▓▓▒░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▓▓▓▓▒▒░▒▒▒▒▓▓▓▓▓▒▒▓▓▒▒▒▒▒▓▓▓▒░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░▒▓▓▓▓▓▓▓▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▓█▓▓▓▒▓▓▓▓▒▒▒▓▓▓▓▓▓▒░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░▒▓▓▓▓▓▓▒▒▓▓▓▓▒▓▓▓▓▒▒▓▓▓▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓▓▓▓▓▒░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓▓▓▓▓▒░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░▒▓▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▓▓▓▓▓▓▒▒░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░▒▒▓▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▓▓▓▓▓▓▒▒▒░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░▒▒▒▓▓▓▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▓▓▓▓▓▓▒▒▒░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███▓▓▓▓▓▓▒░░░░░░░░░░░░░░</p><p>░░░░░░░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███▓▓▓▓▓▓▓▓▒▒▒░░░░░░░░░░░</p><p>░░░░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████▓▓▓▓▓▓▓▓▓▒▒░░░░░░░░</p><p>░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█████████▓▓▓▓▓▓▓▓▓▓▓▓████████████▓▓▓▓▓▒▒▒▒▓▓▓▓▓▓▒░░░░░</p><p>░░░░▒▒▓▓▓▓▓▒▓▓▓▓▒▒▓▓▓▓▓▓▓▒▒▒░▒▒▒▒▒▒▒▒▒▓▓▒▒▓▓▓▓▓▓▓███▓▓▓▓▓▓▒▓▓▓▓▒▓▓▓▓▓▓▒▓▓▓▓▒▒▒░░</p><p>░▒▒▓▓▓▓▓▒░░▒▓▓▓▓▒▒▒▒▒▒▒▒▓▒░░░░░░▒▓▓▓▓▓▓▒▓▓▓▓▓▓██▓▓▓▓▒▒▓▓▓▓▓▓▓▒▒░░░▒▓▓▓▓▓▓▒▓▓▒░░░</p><p>░▒▓▓▓▒▓▓░░░░░▒▓▓▒▒▒▒▒▒▒▒░░░░░░░░░░▒████████████████▓▓▒░░░░░▒▓▓▓▒▒░░░░▒▓▓▓▓▓▓▓▒░░</p><p>░░▓▓▓▒▓▒░░░░░░░▒▒▓▓▒▒▒▒▒░░░░░░░░░░░░░░▒▒▓█████████▓▒░░░░░░░░░▒▓▓▓▒░░░░░░▒▓▓▓▓▒░░</p><p>░▒▓▓▒░▒▒░░░░░░░░░░▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▓▓▓▒░░░░░░▓▓▓▒░░</p><p>░░▒▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▓▓▓▒░░░░░▒▓▓▒░░</p><p>░░░░▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▓▓▒░░░░░▒▓▓░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▓▓▒░░░░░░▓▒░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▓▒░░░░░░▒▒░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒░░░░░░░░░░░░░</p><p>░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░</p></p></html>');
    
        welcomeLabel.setForeground(Color.WHITE);
        welcomeLabel.setHorizontalAlignment(JLabel.CENTER);
        welcomeLabel.setFont(new Font("Monospace", Font.PLAIN, 5));
        titleConfigPanel.add(welcomeLabel);
 
        mainPanel.add(mainConfiguration);
        subPanel.add(titleConfigPanel);
       
        var startButton = new JButton('Click Here To Start Bot');
        startButton.setBackground(Color.ORANGE);
        startButton.setForeground(Color.BLACK);
  
        startButton.addActionListener({
            actionPerformed: function(e) {
                
                clientThread.invoke(new java.lang.Runnable({
                    run: function() {
                       function validateString(input, varName) {
                           if (input.trim() === '') {
                               return '0';
                           }
                    
                           var validPattern = /^[\d,\s]+$/;
                           if (!validPattern.test(input)) {
                               bot.printGameMessage("Invalid characters in " + varName + ". Terminating");
                               bot.terminate();
                               return null;
                           }
                    
                           return input;
                       }

                       var defaultAmmoListString = validateString(ammoTextField.getText(), 'Ammo Text Field?');
           
                       bot.bmCache.saveBoolean('defaultMeleeStyle', defaultMeleeStyleCheckbox.isSelected());
                       bot.bmCache.saveBoolean('defaultDharoks', defaultDharoksCheckbox.isSelected());
                       bot.bmCache.saveBoolean('defaultRangedStyle', defaultRangedStyleCheckbox.isSelected());
                       bot.bmCache.saveBoolean('defaultOffensivePrayer', defaultOffensivePrayerCheckbox.isSelected());
                       bot.bmCache.saveBoolean('defaultLoot', defaultLootCheckbox.isSelected());
                       bot.bmCache.saveString('defaultAmmoList', defaultAmmoListString);
  
                       startBot();
                    }
                }));
                frame.dispose();
            }
        });
 
        frame.addWindowListener({
           windowClosing: function(event) {
               var result = JOptionPane.showConfirmDialog(
                   frame, 
                   "Are you sure you want to exit the GUI and terminate the script?", 
                   "Exit Confirmation", 
                   JOptionPane.YES_NO_OPTION
               );
       
               if (result == JOptionPane.YES_OPTION) {
                   frame.dispose();
                   bot.terminate();
               }
           }
        });
     
        frame.add(mainPanel, BorderLayout.CENTER);
        frame.add(subPanel, BorderLayout.EAST);
        frame.add(startButton, BorderLayout.SOUTH);
        frame.setVisible(true);
    }
}
 
function startBot() {

     function validateIntegerString(input, varName) {
         // Only allow digits, no spaces, no commas, no other characters
         if (!/^[0-9]+$/.test(input.trim())) {
             bot.printGameMessage("Invalid value for " + varName + ". Only whole numbers are allowed. Terminating.");
             bot.printLogMessage("Invalid value for " + varName + ". Only whole numbers are allowed. Terminating.");
             bot.terminate();
             return null;
         }
         return input.trim();
     }
 
     useRanged = bot.bmCache.getBoolean('defaultRangedStyle', false);
     usingDharoks = bot.bmCache.getBoolean('defaultDharoks', false);
     useOffensivePrayer = bot.bmCache.getBoolean('defaultOffensivePrayer', false);
     lootAmmo = bot.bmCache.getBoolean('defaultLoot', false);

     var ammoIDString = bot.bmCache.getString('defaultAmmoList', '0');
     ammoIDString = validateIntegerString(ammoIDString, 'Ammo ID');
     ammoID = parseInt(ammoIDString, 10);
     ammoIDs.push(ammoID);
 
     var newSimulateClickOn = configManager.getConfiguration("theplug-utils", "simulateClickDuration"); //needs to be true
    
     if (newSimulateClickOn == "false") {
         errors.push("USER ERROR: You need to turn -Simulate Click Duration- ON in ThePlug Utils");
     }
    
     var newSimulateClickMax100 = configManager.getConfiguration("theplug-utils", "simulateClickMax"); //needs to be <=100
    
     if (newSimulateClickMax100 > 50) {
         errors.push("USER ERROR: You need to set -Click Duration Max- to 50 in ThePlug Utils");
     }
    
     var newSimulateClickMin30 = configManager.getConfiguration("theplug-utils", "simulateClickMin"); //needs to be >=30
    
     if (newSimulateClickMin30 < 30) {
         errors.push("USER ERROR: You need to set -Click Duration Min- to 30 in ThePlug Utils");
     }
    
     var newSimulateClickMouse5 = configManager.getConfiguration("theplug-utils", "simulateClickWeight"); //needs to be =5
    
     if (newSimulateClickMouse5 != 5) {
         errors.push("USER ERROR: You need to set -Click Duration Weight- to 5 in ThePlug Utils");
     }
 
     var onlyLootOwnDrops = configManager.getConfiguration("theplug-utils", "onlyLootOwnDrops");
  
     if (onlyLootOwnDrops == "false") {
         errors.push("USER ERROR: You need to turn -Only Loot Own Drops- ON within the ThePlug Utils plugin");
     }
   
     var screenshotsOn = configManager.getConfiguration("runelite", "screenshotplugin"); //needs to be true
    
     if (screenshotsOn == "false") {
         errors.push("USER ERROR: You need to turn the -Screenshots- plugin ON");
     }
     
     var screenshotDeathsOn = configManager.getConfiguration("screenshot", "playerDeath"); //needs to be true
     
     if (screenshotDeathsOn == "false") {
         errors.push("USER ERROR: You need to turn -Screenshot Deaths- ON within the Screenshot plugin");
     }
 
     var continueClickerOn = configManager.getConfiguration("runelite", "continueplugin"); //needs to be true
    
     if (continueClickerOn == "false") {
         errors.push("USER ERROR: You need to turn -ThePlug Continue Clicker- ON");
     }
     
     var ammoPickingBehaviour = client.getVarbitValue(5697);
     if (ammoPickingBehaviour === 0) {
         errors.push("USER ERROR: You need to turn -Ammo-Picking Behaviour- ON in the in-game settings.");
     }
 
     var disableLevelUpInterface = client.getVarbitValue(9452);
     if (disableLevelUpInterface === 0) {
         errors.push("USER ERROR: You need to turn -Disable Level-Up Interface- ON in the in-game settings.");
     }
 
     var blockSpontaneousBroadcasts = client.getVarbitValue(9597);
     if (blockSpontaneousBroadcasts === 0) {
         errors.push("USER ERROR: You need to turn -Block Spontaneous Pop-Up Promotional Messages- ON in the in-game settings.");
     }

     if (!isPlayerNearLocation(crabsLocation1, 10) && !isPlayerNearLocation(crabsLocation2, 10) && !isPlayerNearLocation(crabsLocation3, 10)) {
        errors.push("USER ERROR: You need to start at a Gemstone Crab location.");
     }
 
     if (errors.length > 0) {
         for (var i = 0; i < errors.length; i++) {
             bot.printGameMessage(errors[i]);
             bot.printLogMessage(errors[i]);
         }
         bot.printLogMessage("Terminating Script. There were errors in the GUI.");
         bot.printGameMessage("Terminating Script. There were errors in the GUI.");
         bot.notifier.sendMessage("GEMSTONE CRAB: Had to terminate Script. There were errors in the GUI.");
         bot.terminate();
         return false;
     }
 
     CONFIG_SET = true;
}
 
function onEnd() {
    bot.walking.webWalkCancel();
}

function onGameTick() {
   
    if (!CONFIG_SET) {
        return false;
    }

    if (supplyTimeout > 0) {
        supplyTimeout--;
    }

    if (attackNPCTimeout > 0) {
        attackNPCTimeout--;
    }

    if (timeout > 0) {
        timeout--;
        return;
    }

    var gemstoneCrab = bot.npcs.getWithIds([14779]);
    if (gemstoneCrab.length > 0) {
        bot.breakHandler.setBreakHandlerStatus(false);
        state = "atTaskSlayingCrab";
    } else {
        bot.breakHandler.setBreakHandlerStatus(true);
        state = "moveToNewCrabLocation";
    }

    if (bot.walking.isWebWalking()) {
        return;
    }

    if (isChatClosed()) {
        bot.printLogMessage("Chat is closed. Opening it.");
        bot.widgets.interactSpecifiedWidget(10616836, 1, 57, -1);
        return;
    }

    if (state === "moveToNewCrabLocation") {
        moveToNewCrabLocation();
        return;
    } else if (state === "atTaskSlayingCrab") {
        killCrab();
        return;
    }
    
}

function moveToNewCrabLocation() {
    if (isOffensivePrayerOn()) {
        bot.printLogMessage("Offensive prayer is on. Turning it off.");
        turnOffOffensivePrayer();
        return;
    }
   
    var defeatedGemstoneCrab = bot.npcs.getWithIds([14780]);
    var caves = bot.objects.getTileObjectsWithNames(["Cave"]);

    if (caves.length > 0 && defeatedGemstoneCrab.length > 0) {
        var cave = bot.objects.getClosest(caves);
        if (cave) {
            bot.printLogMessage("Moving to new Crab location as Crab defeated.");
            if (!bot.localPlayerMoving() || bot.localPlayerIdle()) {
                bot.printLogMessage("Crawling through cave.");
                
                bot.objects.interactSuppliedObject(cave, "Crawl-through");
                timeout = 25;
            }
            return;
        }
    } else if (caves.length > 0 && defeatedGemstoneCrab.length === 0) {
        var cave = bot.objects.getClosest(caves);
        if (cave) {
            bot.printLogMessage("Moving to new Crab location as no Crab or Defeated Crab found.");
            bot.objects.interactSuppliedObject(cave, "Crawl-through");
            timeout = 14;
        }
        return;
    }
}

function killCrab() {
    
    if (bot.inventory.containsId(10012)) {
        bot.printLogMessage("Dropping Butterfly Jar.");
        bot.inventory.interactWithIds([10012], ["Drop"]);
        return;
    }

    if (bot.inventory.containsId(229)) {
        bot.printLogMessage("Dropping Vial.");
        bot.inventory.interactWithIds([229], ["Drop"]);
        return;
    }

    if (useRanged && lootAmmo) {
        var ammoLoot = bot.tileItems.getItemsWithIds(ammoIDs);
        if (ammoLoot.length > 0) {
            for (var i = 0; i < ammoLoot.length; i++) {
                var item = ammoLoot[i];
                var itemID = item.item.getId();
                var itemQuantity = item.item.getQuantity();
                var itemName = client.getItemDefinition(itemID).getName();
                var isStackable = client.getItemDefinition(itemID).isStackable();
                if (itemQuantity >= 20) {
                    if ((!bot.inventory.isFull() || (bot.inventory.isFull() && isStackable && (bot.inventory.containsId(itemID) || bot.equipment.containsId(itemID))))) {
                        bot.printLogMessage("Found stack of Ammo. Looting: " + itemName + " (with quantity: " + itemQuantity + ")");
                        bot.tileItems.lootItemsWithIds(ammoIDs, 15);
                        return;
                    }
                }
            }
        }
    }

    if (supplyTimeout === 0) {
        if (checkIfPrayerLow()) return;
        if (checkIfStrengthLow()) return;
        if (checkIfAttackLow()) return;
        if (checkIfRangedLow()) return;
        if (isHeartInactive()) return;
        if (!usingDharoks && checkIfHPLow()) return;
    }

    if (useOffensivePrayer) {
        var boostedPrayerLevel = client.getBoostedSkillLevel(net.runelite.api.Skill.PRAYER);
        if (!isOffensivePrayerOn() && boostedPrayerLevel > 0) {
            bot.printLogMessage("Offensive prayer is off. Turning it on.");
            turnOnOffensivePrayer();
            return;
        }
    }

    if (!useRanged && usingDharoks) {
        if (bot.inventory.containsAnyIds([22081, 7510])) {
            var boostedHpLevel = client.getBoostedSkillLevel(net.runelite.api.Skill.HITPOINTS);
            if (boostedHpLevel > 1) {
                bot.printLogMessage("Using Rock Cake/Loc Orb to drop HP.");
                if (bot.inventory.containsId(22081)) {
                    bot.inventory.interactWithIds([22081], ["Feel"]);
                } else if (bot.inventory.containsId(7510)) {
                    bot.inventory.interactWithIds([7510], ["Guzzle"]);
                }
                return;
            }
        }
    }

    if (!isPlayerInteractingWithNpc()) {
        var gemstoneCrab = bot.npcs.getWithIds([14779]);
        if (gemstoneCrab.length > 0) {
            var gemstoneCrabNPC = gemstoneCrab[0];
            if (!gemstoneCrabNPC.isDead()) {
               bot.printLogMessage("Attacking Gemstone Crab.");
               bot.npcs.interactSupplied(gemstoneCrabNPC, 'Attack');
               attackNPCTimeout = 3;
               return;
            }
        }
    }
}

function onChatMessage(type, name, message) {
    if (message.includes("Oh dear, you are dead!")) {
        bot.printGameMessage("You are dead. Terminating.");
        bot.printLogMessage("You are dead. Terminating.");
        bot.notifier.sendMessage("GEMSTONE CRAB: Terminating as you are dead.");
        bot.terminate();
        return;
    }

    if (message.includes("There is no ammo left in your quiver.")) {
        bot.printLogMessage("No ammo left. Terminating.");
        bot.printGameMessage("No ammo left. Terminating.");
        bot.notifier.sendMessage("GEMSTONE CRAB: Terminating as you have no ammo left.");
        bot.terminate();
        return;
    }
}

function isPlayerInteractingWithNpc() {
    var playerInteraction = client.getLocalPlayer().getInteracting();
    return playerInteraction;
}

function checkIfPrayerLow() {
    var boostedPrayerLevel = client.getBoostedSkillLevel(net.runelite.api.Skill.PRAYER);

    if (boostedPrayerLevel <= 5 && bot.inventory.containsAnyIds(prayerPotIDs)) {
        bot.inventory.interactWithIds(prayerPotIDs, ["Drink", "Release"]);
        supplyTimeout = 3;
        return true;
    }

    return false;
}

function getRestoreAmountRangedPotions(realLevel) {
    if (realLevel <= 9) return 4;
    if (realLevel <= 19) return 5;
    if (realLevel <= 29) return 6;
    if (realLevel <= 39) return 7;
    if (realLevel <= 49) return 8;
    if (realLevel <= 59) return 9;
    if (realLevel <= 69) return 10;
    if (realLevel <= 79) return 11;
    if (realLevel <= 89) return 12;
    if (realLevel <= 99) return 13;
}

function getRestoreAmountRegularPotions(realLevel) {
    if (realLevel <= 9) return 3;
    if (realLevel <= 19) return 4;
    if (realLevel <= 29) return 5;
    if (realLevel <= 39) return 6;
    if (realLevel <= 49) return 7;
    if (realLevel <= 59) return 8;
    if (realLevel <= 69) return 9;
    if (realLevel <= 79) return 10;
    if (realLevel <= 89) return 11;
    if (realLevel <= 99) return 12;
}

function getRestoreAmountSuperPotions(realLevel) {  
    if (realLevel <= 6) return 5;
    if (realLevel <= 13) return 6;
    if (realLevel <= 19) return 7;
    if (realLevel <= 26) return 8;
    if (realLevel <= 33) return 9;
    if (realLevel <= 39) return 10;
    if (realLevel <= 46) return 11;
    if (realLevel <= 53) return 12;
    if (realLevel <= 59) return 13;
    if (realLevel <= 66) return 14;
    if (realLevel <= 73) return 15;
    if (realLevel <= 79) return 16;
    if (realLevel <= 86) return 17;
    if (realLevel <= 93) return 18;
    if (realLevel <= 99) return 19;
}

function checkIfStrengthLow() {
    var realStrengthLevel = client.getRealSkillLevel(net.runelite.api.Skill.STRENGTH);
    var boostedStrengthLevel = client.getBoostedSkillLevel(net.runelite.api.Skill.STRENGTH);
    var strengthPotIdsRegular = [113, 115, 117, 119, 9745, 9743, 9741, 9739];
    var strengthPotIdsSuper = [23709, 23712, 23715, 23718, 23685, 23688, 23691, 23694, 12695, 12697, 12699, 12701, 2440, 157, 159, 161];

    if (bot.inventory.containsAnyIds(strengthPotIdsSuper)) {
        var restoreAmount = getRestoreAmountSuperPotions(realStrengthLevel);

        if (boostedStrengthLevel < ((realStrengthLevel + restoreAmount) - Math.min(5, restoreAmount))) {
            bot.inventory.interactWithIds(strengthPotIdsSuper, ["Drink"]);
            supplyTimeout = 3;
            return true;
        }
    }

    if (bot.inventory.containsAnyIds(strengthPotIdsRegular)) {
        var restoreAmount = getRestoreAmountRegularPotions(realStrengthLevel);

        if (boostedStrengthLevel < ((realStrengthLevel + restoreAmount) - Math.min(5, restoreAmount))) {
            bot.inventory.interactWithIds(strengthPotIdsRegular, ["Drink"]);
            supplyTimeout = 3;
            return true;
        }
    }

    return false;
}

function checkIfAttackLow() {
    var realAttackLevel = client.getRealSkillLevel(net.runelite.api.Skill.ATTACK);
    var boostedAttackLevel = client.getBoostedSkillLevel(net.runelite.api.Skill.ATTACK);
    var attackPotIdsRegular = [2428, 121, 123, 125, 9745, 9743, 9741, 9739];
    var attackPotIdsSuper = [23697, 23700, 23703, 23706, 23685, 23688, 23691, 23694, 12695, 12697, 12699, 12701, 2436, 145, 147, 149];

    if (bot.inventory.containsAnyIds(attackPotIdsSuper)) {
        var restoreAmount = getRestoreAmountSuperPotions(realAttackLevel);

        if (boostedAttackLevel < ((realAttackLevel + restoreAmount) - Math.min(5, restoreAmount))) {
            bot.inventory.interactWithIds(attackPotIdsSuper, ["Drink"]);
            supplyTimeout = 3;
            return true;
        }
    }

    if (bot.inventory.containsAnyIds(attackPotIdsRegular)) {
        var restoreAmount = getRestoreAmountRegularPotions(realAttackLevel);

        if (boostedAttackLevel < ((realAttackLevel + restoreAmount) - Math.min(5, restoreAmount))) {
            bot.inventory.interactWithIds(attackPotIdsRegular, ["Drink"]);
            supplyTimeout = 3;
            return true;
        }
    }

    return false;
}

function checkIfRangedLow() {
    var realRangedLevel = client.getRealSkillLevel(net.runelite.api.Skill.RANGED);
    var boostedRangedLevel = client.getBoostedSkillLevel(net.runelite.api.Skill.RANGED);
    var rangedPotIds = [173, 171, 169, 2444, 23742, 23739, 23736, 23733];

    if (bot.inventory.containsAnyIds(rangedPotIds)) {
        var restoreAmount = getRestoreAmountRangedPotions(realRangedLevel);

        if (boostedRangedLevel < ((realRangedLevel + restoreAmount) - Math.min(5, restoreAmount))) {
            bot.inventory.interactWithIds(rangedPotIds, ["Drink"]);
            supplyTimeout = 3;
            return true;
        }
    }

    return false;
}

function isHeartInactive() {
    var cooldown = client.getVarbitValue(5361);

    if (bot.inventory.containsAnyIds([20724, 27641]) && cooldown === 0) {
        bot.inventory.interactWithIds([20724, 27641], ["Invigorate"]);
        return true;
    }

    return false;
}

function checkIfHPLow() {
    var realHpLevel = client.getRealSkillLevel(net.runelite.api.Skill.HITPOINTS);
    var boostedHpLevel = client.getBoostedSkillLevel(net.runelite.api.Skill.HITPOINTS);

    if (bot.inventory.containsAnyIds(foodIDs)) {
       if (realHpLevel - boostedHpLevel >= 22) {
           bot.inventory.interactWithIds(foodIDs, ["Eat"]);
           supplyTimeout = 3;
           return true;
       }
    }
    
    return false;
}

function isPlayerNearLocation(targetLocation, minDistance) {
    return distanceFromWorldPoint(client.getLocalPlayer(), targetLocation) <= minDistance
}

function distanceFromWorldPoint(lp, wp) {
    var playerWorldPoint = getTrueWorldPoint(lp.getWorldLocation());
    var distance = wp.distanceTo(playerWorldPoint);
    return distance;
}

function getTrueWorldPoint(wp) {
    var localPoint = new net.runelite.api.coords.LocalPoint.fromWorld(client, wp)
    return net.runelite.api.coords.WorldPoint.fromLocalInstance(client, localPoint);
}

function isChatClosed() {
    return client.getVarcIntValue(41) == 1337;
}

function isOffensivePrayerOn() {
    return (
        client.isPrayerActive(net.runelite.api.Prayer.BURST_OF_STRENGTH) ||
        client.isPrayerActive(net.runelite.api.Prayer.SHARP_EYE) ||
        client.isPrayerActive(net.runelite.api.Prayer.MYSTIC_WILL)
    );
}

function turnOnOffensivePrayer() {
    var boostedPrayerLevel = client.getBoostedSkillLevel(net.runelite.api.Skill.PRAYER);
 
    if (boostedPrayerLevel === 0) {
       return;
    }
    
    if (useRanged && !client.isPrayerActive(net.runelite.api.Prayer.SHARP_EYE)) {
       bot.printLogMessage("Turning on Sharp Eye.");
       bot.prayer.togglePrayer(net.runelite.api.Prayer.SHARP_EYE, true);
       return;
    } else if (!client.isPrayerActive(net.runelite.api.Prayer.BURST_OF_STRENGTH)) {
       bot.printLogMessage("Turning on Burst of Strength.");
       bot.prayer.togglePrayer(net.runelite.api.Prayer.BURST_OF_STRENGTH, true);
       return;
    }
}

function turnOffOffensivePrayer() {
    if (client.isPrayerActive(net.runelite.api.Prayer.BURST_OF_STRENGTH)) {
        bot.printLogMessage("Turning off Burst of Strength.");
        bot.prayer.togglePrayer(net.runelite.api.Prayer.BURST_OF_STRENGTH, true);
        return;
    } else if (client.isPrayerActive(net.runelite.api.Prayer.SHARP_EYE)) {
        bot.printLogMessage("Turning off Sharp Eye.");
        bot.prayer.togglePrayer(net.runelite.api.Prayer.SHARP_EYE, true);
        return;
    }
}

const randomInt = () => Math.floor(Math.random() * (max - min + 1)) + min;