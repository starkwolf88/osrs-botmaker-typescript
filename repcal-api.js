//Global Vars
var isF2pQuest = false;
var timeout = 0;
var invSetDepsoit = false;
var setupInventory = false;
var questComplete = false;
var itemIDToBuy = null;
var itemToBuy = null;
var quantityToBuy = null;
var priceToBuy = null;
var geComplete = false;
var depositInvent = false;
var depositEquip = false;
var checkedBank = false;
var shoppingItems = [];
var useGe = api.getBooleanVariable("Use Grand Exchange?");

//Widgets
function Widget(pid, id, op, param) {
    this.pid = pid;
    this.id = id;
    this.op = op;
    this.param = param;
}
Widget.prototype.isVisible = function () {
    let targetWidget = client.getWidget(this.pid);

    if (targetWidget != null && !targetWidget.isHidden()) {
        return true
    }
}
Widget.prototype.click = function () {
    api.interactSpecifiedWidget(this.pid, this.id, this.op, this.param);
}

//Player
function Player() {
    this.p = client.getLocalPlayer();
}

Player.prototype.getBoostedSkill = function(skill) {
    return client.getBoostedSkillLevel(net.runelite.api.Skill[skill.toUpperCase()]);
}

Player.prototype.getRealSkill = function(skill) {
    return client.getRealSkillLevel(net.runelite.api.Skill[skill.toUpperCase()]);
}


Player.prototype.isInteracting = function() {
    return this.p.isInteracting();
}

Player.prototype.getInteracting = function() {
    return this.p.getInteracting();
}

Player.prototype.getOrientation = function() {
    return this.p.getOrientation();
}

Player.prototype.getSpotAnims = function() {
    return this.p.getSpotAnims();
}

Player.prototype.getWorldLocation = function() {
    return this.p.getWorldLocation();
}

function Navigation(x, y, z, width, height) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.p = client.getLocalPlayer().getWorldLocation();

    if (client.isInInstancedRegion()) {
        this.worldPoint = this.convertToWorldPoint();
    }

    if (!client.isInInstancedRegion()) {
        this.worldPoint = new net.runelite.api.coords.WorldPoint(x, y, z);
    }

    if (width != null && height != null) {
      this.worldArea = new net.runelite.api.coords.WorldArea(this.worldPoint, width, height);
    }
}

Navigation.prototype.playerNearPoint = function(radius) {
    var px = this.p.getX();
    var py = this.p.getY();
    var pz = this.p.getPlane();
    var rxPlus = this.worldPoint.getX() + radius;
    var rxMinus = this.worldPoint.getX() - radius;
    var ryPlus = this.worldPoint.getY() + radius;
    var ryMinus = this.worldPoint.getY() - radius;

    if (px <= rxPlus && px >= rxMinus && py <= ryPlus && py >= ryMinus && pz == this.z) {
        return true
    }
}

Navigation.prototype.webWalk = function() {
    api.webWalkStart(this.worldPoint);
}

Navigation.prototype.walk = function() {
    api.walkToWorldPoint(this.worldPoint.getX(), this.worldPoint.getY());
}

Navigation.prototype.playerInArea = function() {
    if (this.worldArea.contains(this.p)) {
        return true
    }
}

Navigation.prototype.convertToWorldPoint = function() {
    let wp = new net.runelite.api.coords.WorldPoint(this.x, this.y, this.z);
    let localInstanceArray = net.runelite.api.coords.WorldPoint.toLocalInstance(client, wp);
    let localInstance = localInstanceArray[0];

    return localInstance;
}

Navigation.prototype.npcNearPoint = function(npcID, radius) {
    var nearNpc = false;
    var npcs = api.getNpcsWithIds([npcID]);
    var npc = npcs[0];
    var wp = this.worldPoint;
    var wpX = wp.getX();
    var wpY = wp.getY();
    if (npc) {
        var npcWp = npc.getWorldLocation();
        var rxPlus = npcWp.getX() + radius;
        var rxMinus = npcWp.getX() - radius;
        var ryPlus = npcWp.getY() + radius;
        var ryMinus = npcWp.getY() - radius;
    
        var idMatches = Array.isArray(npcID) ? npcID.includes(npc.getId()) : npc.getId() === npcID;
    
        if (idMatches && wpX <= rxPlus && wpX >= rxMinus && wpY <= ryPlus && wpY >= ryMinus) {
            nearNpc = true;
        }
    
        if (nearNpc) {
            return true;
        }
    }


    return false;

}

Navigation.prototype.npcInArea = function(npcID) {
    var npcs = api.getNpcsWithIds([npcID]);
    
    var npc = npcs[0];

    if (npc) {
        var npcWp = npc.getWorldLocation();

        var idMatches = Array.isArray(npcID) ? npcID.includes(npc.getId()) : npc.getId() === npcID;

        if (npcWp) {
            if (idMatches && this.worldArea.contains(npcWp)) {
                return true
            }
        }
    }
}

Navigation.prototype.otherPlayerInArea = function() {
    var p = client.getLocalPlayer();
    var players = client.getPlayers();

    if (players) {
        players.forEach((player) => {
            if (player !== null && player !== p) {
                var wp = player.getWorldLocation();
                if (wp != null && this.WorldArea.contains(wp)) {
                    return true
                }
            }
        });
    }
    return false
}

//Item
function Item(itemID, quantity, clickOption, geBuyValue, shouldNote, geSellValue) {
    this.itemID = itemID;
    this.quantity = quantity;
    this.noted = shouldNote;
    this.clickOption = clickOption;
    this.geBuyValue = geBuyValue;
    this.geSellValue = geSellValue;
  }
  
  Item.prototype.getName = function () {
    return client.getItemDefinition(this.itemID).getName();
  }
  
  Item.prototype.getID = function () {
    return this.itemID.getLinkedNoteId();
  }
  
  Item.prototype.invContains = function (any) {
    var inv = client.getItemContainer(93);
    var itemID = this.itemID;
    var quantity = this.quantity;
  
  
      if (inv != null && any == true) {
        for (var i = 0; i < inv.size(); i++) {
          var item = inv.getItem(i);
  
          if (item != null && (item.getId() == itemID)) {
            return true
          }
        }
        return false
      }
  
    if (inv != null) {
        var amount = 0;
  
        for (var i = 0; i < inv.size(); i++) {
            var item = inv.getItem(i);
  
            if (item != null && (item.getId() == itemID)) {
                amount += item.getQuantity();
            }
        }
        if (amount >= quantity) {
            return true
        }
        return false
    }
  }
  
  Item.prototype.bankContains = function () {
    var inv = client.getItemContainer(95);
    var itemID = this.itemID;
    var quantity = this.quantity;
  
    if (inv != null) {
        var amount = 0;
  
        for (var i = 0; i < inv.size(); i++) {
            var item = inv.getItem(i);
  
            if (item != null && (item.getId() == itemID)) {
                amount += item.getQuantity();
            }
        }
        if (amount >= quantity) {
            return true
        }
        return false
    }
  }
  
  Item.prototype.withdraw = function () {
    var state = api.getCounter("JS API - Banking Withdraw");
    var noteState = client.getVarbitValue(3958);
    var withdrawX = client.getVarbitValue(3960);
    var noTypeDelay = [1, 5, 10];
    var noted = new Widget(786456, 1, 57, -1);
    var unNoted = new Widget(786454, 1, 57, -1);
  
    if (state != 0) {
        return
    }
  
    if (noteState === 0 && this.noted) {
        noted.click();
    }
  
    if (noteState === 1 && !this.noted) {
        unNoted.click();
    }
  
    //withdraw x
    if (this.quantity != "all") {
        api.setCounter("JS API - Banking Withdraw", 2);
        api.setVariable("JS API - Banking Withdraw Quantity", this.quantity);
    }
    //withdraw all
    if (this.quantity == "all") {
        api.setCounter("JS API - Banking Withdraw", 1);
    }
  
    api.setVariable("JS API - Banking Withdraw Item", this.itemID);
  
    if (this.quantity != withdrawX && !noTypeDelay.includes(this.quantity)) {
        return timeout = 5;
    } else {
        return timeout = 1;
    }
  }
  
  Item.prototype.deposit = function () {
    var state = api.getCounter("JS API - Banking Deposit");
  
    if (state != 0) {
        return
    }
  
    api.setVariable("JS API - Banking Deposit Item", this.itemID);
    api.setCounter("JS API - Banking Deposit", 1);
    return timeout = 2;
  
  }
  
  Item.prototype.haveLinkedItem = function () {
    var inv = client.getItemContainer(93);
    var itemID = this.itemID;
    var quantity = this.quantity;
  
    if (inv != null) {
        var amount = 0;
  
        for (var i = 0; i < inv.size(); i++) {
            var item = inv.getItem(i);
  
            if (item != null && (item.getId() == itemID || item.getId() == client.getItemDefinition(itemID).getLinkedNoteId())) {
                amount += item.getQuantity();
            }
        }
        if (amount >= quantity) {
            return true
        }
        return false
    }
  }
  
  Item.prototype.click = function () {
    api.interactInventoryWithIds([this.itemID], [this.clickOption]);
  }
  
  Item.prototype.useOnObject = function (objectId, delay) {
    let x = "JS API - Item on Object";
    let state = api.getCounter(x);
  
    if (state == 0) {
        api.setVariable("JS API - Item on Object itemInt", this.itemID);
        api.setVariable("JS API - Item on Object objectInt", objectId);
        api.setCounter(x, 1);
        return timeout = delay;
    }
  }
  
  Item.prototype.useOnNpc = function (npcId, delay) {
    let x = "JS API - Item on Npc";
    let state = api.getCounter(x);
  
    if (state == 0) {
        api.setVariable("JS API - Item on Npc itemInt", this.itemID);
        api.setVariable("JS API - Item on Npc npcInt", npcId);
        api.setCounter(x, 1);
        return timeout = delay;
    }
  }
  
  Item.prototype.useOnItem = function (itemId, delay) {
    let x = "JS API - Item on Item";
    let state = api.getCounter(x);
  
    if (state == 0) {
        api.setVariable("JS API - Item on Item itemInt1", this.itemID);
        api.setVariable("JS API - Item on Item itemInt2", itemId);
        api.setCounter(x, 1);
        return timeout = delay;
    }
  }
  
  Item.prototype.itemEquipped = function () {
    var inv = client.getItemContainer(94);
    var itemID = this.itemID;
  
    if (inv != null) {
        for (var i = 0; i < inv.size(); i++) {
            var item = inv.getItem(i);
  
            if (item != null && (item.getId() == itemID)) {
                return true
            }
        }
        return false
    }
  }
  
  Item.prototype.nearItem = function (radius) {
    var p = client.getLocalPlayer().getWorldLocation();
    var itemId = this.itemID;
    var sceneTiles = client.getScene().getTiles()[client.getPlane()];
    for (let x = 0; x < sceneTiles.length; x++) {
        for (let y = 0; y < sceneTiles[x].length; y++) {
            if (sceneTiles[x][y] !== null && typeof sceneTiles[x][y].getGroundItems === 'function') {
                let groundItems = sceneTiles[x][y].getGroundItems();
  
                if (groundItems !== null) {
                    let itemsArray = groundItems.toArray();
                    for (let i = 0; i < itemsArray.length; i++) {
                        if (itemsArray[i].getId() == itemId) {
                            let itemWp = sceneTiles[x][y].getWorldLocation();
                            let distanceTo = itemWp.distanceTo2D(p);
  
                            if (distanceTo <= radius) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
  }
  
  Item.prototype.loot = function (radius) {
    return api.lootItemsWithIds([this.itemID], radius);
  }

//TileObject
function TileObject(objectID, text, x, y) {
    this.objectID = objectID;
    this.text = text;
    this.sceneTiles = client.getScene().getTiles()[client.getPlane()];
    this.p = client.getLocalPlayer().getWorldLocation();

    if (x && y) {
        this.targetWorldPoint = net.runelite.api.coords.WorldPoint(x, y, client.getPlane());
    }
}

TileObject.prototype.nearObject = function(distance) {
    for (let x = 0; x < this.sceneTiles.length; x++) {
        for (let y = 0; y < this.sceneTiles[x].length; y++) {
            let tile = this.sceneTiles[x][y];
            if (tile !== null) {
                let allObjects = []
                    .concat(tile.getGameObjects() || [], tile.getWallObject() || [], tile.getGroundObject() || [], tile.getDecorativeObject() || [])
                    .filter(obj => obj !== null && typeof obj.getId === 'function');
 
                for (let i = 0; i < allObjects.length; i++) {
                    if (allObjects[i].getId() == this.objectID) {
                        let objWp = allObjects[i].getWorldLocation();
                        let distanceTo = objWp.distanceTo2D(this.p);

                        if (this.targetWorldPoint != null) {
                           
                            if (distanceTo <= distance && objWp.toString() == this.targetWorldPoint.toString()) {
                                return true;
                            }
                        } else if (distanceTo <= distance) {
                                return true;
                            }
                    }
                }
            }
        }
    }


    return false;
 }

 function TileObject(objectID, text, x, y) {
    this.objectID = objectID;
    this.text = text;
    this.sceneTiles = client.getScene().getTiles()[client.getPlane()];
    this.p = client.getLocalPlayer().getWorldLocation();

    if (x && y) {
        this.targetWorldPoint = net.runelite.api.coords.WorldPoint(x, y, client.getPlane());
    }
}

TileObject.prototype.nearObject = function(distance) {
    for (let x = 0; x < this.sceneTiles.length; x++) {
        for (let y = 0; y < this.sceneTiles[x].length; y++) {
            let tile = this.sceneTiles[x][y];
            if (tile !== null) {
                let allObjects = []
                    .concat(tile.getGameObjects() || [], tile.getWallObject() || [], tile.getGroundObject() || [], tile.getDecorativeObject() || [])
                    .filter(obj => obj !== null && typeof obj.getId === 'function');
 
                for (let i = 0; i < allObjects.length; i++) {
                    if (allObjects[i].getId() == this.objectID) {
                        let objWp = allObjects[i].getWorldLocation();
                        let distanceTo = objWp.distanceTo2D(this.p);

                        if (this.targetWorldPoint != null) {
                           
                            if (distanceTo <= distance && objWp.toString() == this.targetWorldPoint.toString()) {
                                return true;
                            }
                        } else if (distanceTo <= distance) {
                                return true;
                            }
                    }
                }
            }
        }
    }


    return false;
 }

TileObject.prototype.click = function(delay) {
    var targetObjects = [];

    for (let x = 0; x < this.sceneTiles.length; x++) {
        for (let y = 0; y < this.sceneTiles[x].length; y++) {
            let tile = this.sceneTiles[x][y];
            if (tile !== null) {
                let allObjects = []
                    .concat(tile.getGameObjects() || [], tile.getWallObject() || [], tile.getGroundObject() || [], tile.getDecorativeObject() || [])
                    .filter(obj => obj !== null && typeof obj.getId === 'function');
 
                for (let i = 0; i < allObjects.length; i++) {
                    if (allObjects[i].getId() == this.objectID) {
                        targetObjects.push(allObjects[i]);
                    }
                }
            }
        }
    }

    if (targetObjects) {
        var closestObj = null;
        var closestDistance = Infinity;

        for (let i = 0; i < targetObjects.length; i++) {
            let obj = targetObjects[i];
            let objWp = obj.getWorldLocation();
            let distanceTo = objWp.distanceTo2D(this.p);

            if (this.targetWorldPoint) {
                if (this.targetWorldPoint.toString() != objWp.toString()) {
                    continue
                }
                api.interactSuppliedObject(obj, this.text);
                return timeout = delay;
            
        } else if (!this.targetWorldPoint && distanceTo <= closestDistance) {
                closestDistance = distanceTo;
                closestObj = obj;   
            }

        }

        if (!this.targetWorldPoint) {
            api.interactSuppliedObject(closestObj, this.text);
            return timeout = delay;
        }

    }
    return
 }

//Npc
//Npc
function Npc(npcID, option) {
    this.npcID = npcID;
    this.option = option;
    this.suppliedNpc = function () {
        let npcs = client.getNpcs();
        let validNpcs = [];
        let p = client.getLocalPlayer();
    
        for (let i = 0; i < npcs.length; i++) {
            let npc = npcs[i];
    
            if (this.option == "Attack" && npc.getInteracting() == client.getLocalPlayer() && npc.getId() == this.npcID) {
                validNpcs.push(npc);
                break
            } 
            else if (this.option == "Attack" && !npc.isInteracting() && npc.getId() == this.npcID) {
                validNpcs.push(npc);
                continue
            } 
            else if (npc.getId() == this.npcID) {
                validNpcs.push(npc);
                continue
            }
        }
    
        if (validNpcs) {
            var loc = p.getWorldLocation();
            var closestNpc = null;
            var closestDistance = Infinity; 
        
            for (let i = 0; i < validNpcs.length; i++) {
                let npc = validNpcs[i];
                let npcLoc = npc.getWorldLocation();
                let distance = npcLoc.distanceTo2D(loc);
        
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestNpc = npc;
                }
            }
        }
        return closestNpc;
    }
}

Npc.prototype.click = function (delay) {
    
    api.interactSuppliedNpc(this.suppliedNpc(), this.option);
    return timeout = delay;
}

Npc.prototype.nearNpc = function (radius) {
    var p = client.getLocalPlayer().getWorldLocation();
    var px = p.getX();
    var py = p.getY();

    if (this.suppliedNpc()) {
        var npcWp = this.suppliedNpc().getWorldLocation();
        var rxPlus = npcWp.getX() + radius;
        var rxMinus = npcWp.getX() - radius;
        var ryPlus = npcWp.getY() + radius;
        var ryMinus = npcWp.getY() - radius;

        if (px <= rxPlus && px >= rxMinus && py <= ryPlus && py >= ryMinus) {
            return true
        }
    }

    return false;
}

Npc.prototype.getInteracting = function () {
    return this.suppliedNpc().getInteracting();
}

Npc.prototype.isInteracting = function () {
    return this.suppliedNpc().isInteracting()
}

Npc.prototype.getOrientation = function () {
    return this.suppliedNpc().getOrientation();
}

Npc.prototype.getWorldLocation = function () {
    return this.suppliedNpc().getWorldLocation();
}

Npc.prototype.getSpotAnims = function () {
    return this.suppliedNpc().getSpotAnims();
}

Npc.prototype.checkHp = function () {
    return Math.round(this.suppliedNpc().getHealthRatio() * 100 / 30);
}

Npc.prototype.getRelativePoint = function (axis, distance) {
    var loc = this.suppliedNpc().getWorldLocation();
    var targetWp = null;

    if (axis == "x") {
        targetWp = loc.dx(distance);
    }

    if (axis == "y") {
        targetWp = loc.dy(distance);
    }

    if (!axis && !distance) {
        targetWp = loc;
    }

    if (targetWp) {
        var x = targetWp.getX();
        var y = targetWp.getY();
        var z = targetWp.getPlane();
        return new Navigation(x, y, z);
    }
}

//Utils
function Utils(printDebugMessage) {
    this.printDebugMessage = printDebugMessage;
  }
  
  Utils.prototype.dialogVisible = function (text) {
    const pid = 14352385;
    let widget = client.getWidget(pid);
  
    if (widget) {
      return widget.getChildren().some(function (x) {
        return x.getType() == 4 && x.getText() == text;
      });
    }
  }
  
  Utils.prototype.inputBoxVisible = function(text) {
    const pid = 10616873;
    var widget = client.getWidget(pid);
    if(widget && text) {
          return widget.getType() == 4 && widget.getText() == text && !widget.isHidden();
       }
  
       if(widget) {
        return widget.getType() == 4 && !widget.isHidden();
     }
    }
  
  Utils.prototype.terminateScript = function () {
  api.setCounter("JS API - Terminate Script", 1);
  }
  
  Utils.prototype.switchScript = function () {
  api.setCounter("JS API - Switch Script", 1);
  }
  
  Utils.prototype.debugMessage = function (message) {
  if (this.printDebugMessage == true) {
    return api.PrintDebugMessage(message);
  }
  
  }
  
  Utils.prototype.message = function (message) {
    api.PrintDebugMessage(message);
    }
  
  Utils.prototype.isIdle = function () {
  return api.localPlayerIdle();
  }
  
  Utils.prototype.isMoving = function () {
  return api.localPlayerMoving();
  }
  
  Utils.prototype.isBankOpen = function () {
  return api.isBankOpen();
  }
  
  Utils.prototype.isMember = function () {
    let status = client.getVarcIntValue(103);
    return status == 1;
  }
  
  Utils.prototype.inCutscene = function () {
    return client.getVarbitValue(542) == 1;
  }
  
  Utils.prototype.typeText = function (b, a) {
    function sendKey(c) {
        let e = new java.awt.event.KeyEvent(client.getCanvas(), 401, Date.now(), 0, java.awt.event.KeyEvent.VK_UNDEFINED, c);
        client.getCanvas().dispatchEvent(e);
        e = new java.awt.event.KeyEvent(client.getCanvas(), 402, Date.now(), 0, java.awt.event.KeyEvent.VK_UNDEFINED, c);
        client.getCanvas().dispatchEvent(e);
        e = new java.awt.event.KeyEvent(client.getCanvas(), 400, Date.now(), 0, java.awt.event.KeyEvent.VK_UNDEFINED, c);
        client.getCanvas().dispatchEvent(e);
    }
  
    function sendEnter() {
        let e = new java.awt.event.KeyEvent(client.getCanvas(), 401, Date.now(), 0, java.awt.event.KeyEvent.VK_ENTER, java.awt.event.KeyEvent.VK_ENTER);
        client.getCanvas().dispatchEvent(e);
        e = new java.awt.event.KeyEvent(client.getCanvas(), 402, Date.now(), 0, java.awt.event.KeyEvent.VK_ENTER, java.awt.event.KeyEvent.VK_ENTER);
        client.getCanvas().dispatchEvent(e);
    }
  
    if (b instanceof java.lang.String) {
        b.toCharArray().forEach(function (c) { sendKey(c); });
    } else {
        b = b.toString();
        for (let i = 0; i < b.length; i++) {
            sendKey(b[i]);
        }
    }
    if (a === true) {
        sendEnter();
    }
  };
  
  
  Utils.prototype.checkStam = function () {
  var energy = client.getEnergy();
  var stamActive = client.getVarbitValue(25);
  var stam1 = new Item(12631, 1, "Drink");
  var stam2 = new Item(12629, 1, "Drink");
  var stam3 = new Item(12627, 1, "Drink");
  var stam4 = new Item(12625, 1, "Drink");
  var ge = new Navigation(3165, 3485, 0);
  
  if (!client.isInInstancedRegion()) {
    if (ge.playerNearPoint(30)) {
      return
    }
  }
  
  
  if (stamActive === 0 && energy <= 8000) {
    if (stam1.invContains()) {
      return stam1.click();
    }
  
    if (stam2.invContains()) {
      return stam2.click();
    }
  
    if (stam3.invContains()) {
      return stam3.click();
    }
  
    if (stam4.invContains()) {
      return stam4.click();
    }
  }
  
  if (energy == 0) {
    if (stam1.invContains()) {
      return stam1.click();
    }
  
    if (stam2.invContains()) {
      return stam2.click();
    }
  
    if (stam3.invContains()) {
      return stam3.click();
    }
  
    if (stam4.invContains()) {
      return stam4.click();
    }
  }
  }
  
  Utils.prototype.checkPoison = function() {
    var poisoned = client.getVarpValue(102);
  
    const antiPoisons = [
      new Item(175, 1, "Drink"),
      new Item(177, 1, "Drink"),
      new Item(179, 1, "Drink"),
      new Item(2446, 1, "Drink"),
      new Item(181, 1, "Drink"),
      new Item(183, 1, "Drink"),
      new Item(185, 1, "Drink"),
      new Item(2448, 1, "Drink"),
    ];
  
    var antiPoison = antiPoisons.find(x => x.invContains());
  
    const antiVenoms = [
      new Item(12905, 1, "Drink"),
      new Item(12907, 1, "Drink"),
      new Item(12909, 1, "Drink"),
      new Item(12911, 1, "Drink"),
      new Item(12913, 1, "Drink"),
      new Item(12915, 1, "Drink"),
      new Item(12917, 1, "Drink"),
      new Item(12919, 1, "Drink"),
    ];
  
    var antiVenom = antiVenoms.find(x => x.invContains());
  
    if (poisoned > 0) {
      if (antiPoison) {
        return antiPoison.click();
      }
  
      if (antiVenom) {
        return antiVenom.click();
      }
    }
  }
  
  Utils.prototype.checkAntifire = function () {
  var antiFire = client.getVarbitValue(3981);
  
  if (antiFire === 0) {
    return true
  }
  }
  
  Utils.prototype.checkSuperAntifire = function () {
  var SuperAntiFire = client.getVarbitValue(6101);
  
  if (SuperAntiFire === 0) {
    return true
  }
  }
  
  Utils.prototype.invFull = function() {
    const container = client.getItemContainer(93);
  
    if (container) {
      return container.count() == 28;
    }
  }
  
  Utils.prototype.invSpaceFree = function(amount) {
    const container = client.getItemContainer(93);
  
    if (container) {
      let usedSpace = container.count();
  
      if (28 - usedSpace >= amount) {
        return true
      }
      return false
    }
  }

//GE
function GrandExchange() {
    this.grandExchangeOffer = client.getGrandExchangeOffers();

    this.isBought = function () {
        if (this.grandExchangeOffer[0].getState() == "BOUGHT") {
            return true;
        }
    }

    this.inProgress = function () {
        if (this.grandExchangeOffer[0].getState() == "BUYING") {
            return true;
        }
    }
}

GrandExchange.prototype.getShoppingList = function () {
    var loopBroken = false;

    // Iterate over the shoppingItems array directly
    for (var inventoryItem of shoppingItems) {
        var result = inventoryItem.haveLinkedItem();

        if (!result) {
            itemIDToBuy = inventoryItem.itemID;
            itemToBuy = inventoryItem.getName();
            quantityToBuy = inventoryItem.quantity;
            priceToBuy = inventoryItem.geBuyValue;

            loopBroken = true;
            break;
        }
    }

    if (!loopBroken) {
        geComplete = true;
    }
}


GrandExchange.prototype.clickGeSearch = function () {
    const pid = 10616882;
    let widget = client.getWidget(pid);
    if (widget) {
        return widget.getDynamicChildren().some(function (x) {
            if (x.getText() == itemToBuy) {
                var index = x.getIndex();
                var test = index - 1;
                return api.interactSpecifiedWidget(pid, 1, 57, test);
            }
        });
    }
}


GrandExchange.prototype.geBuy = function () {
    var geWindow = new Widget(30474242, 1, 57, 11);
    var geItem = client.getVarpValue(1151);
    var buyOfferState = client.getVarbitValue(4439);
    var geItemCurrentPrice = client.getVarbitValue(4398);
    var geItemCurrentQuantity = client.getVarbitValue(4396);
    var inputType = client.getVarcIntValue(5);
    var geLastSearchedState = client.getVarbitValue(10295);
    var setQuantity = new Widget(30474265, 1, 57, 7);
    var setPrice = new Widget(30474265, 1, 57, 12);
    var buyOffer = new Widget(30474247, 1, 57, 3);
    var geConfirm = new Widget(30474269, 1, 57, -1);
    var geCollect = new Widget(30474246, 1, 57, 0);
    var geLastSearched = new Widget(10616884, 1, 57, -1);
    var inputText = client.getVarcStrValue(359);
    var ge = new Navigation(3165, 3485, 0);

    if (!ge.playerNearPoint(15)) {
        return ge.webWalk();
    }

    if (!geComplete) {
        if (!geWindow.isVisible()) {
            api.interactNpc("Grand Exchange Clerk", "Exchange");
            timeout = 2;
            return
        }

        if (geWindow.isVisible() && buyOfferState === 0) {
            if (this.inProgress()) {
                return
            }
            if (this.isBought()) {
                geCollect.click();
                //timeout = 1;
                return
            }
            if (!this.isBought()) {
                buyOffer.click();
                //timeout = 1;
                return
            }
        }

        if (geWindow.isVisible() && buyOfferState === 1) {
            if (geItem === -1) {
                if (geLastSearchedState === 0) {
                    geLastSearched.click();
                    //  timeout = 1;
                    return
                }

                if (inputText == "") {
                    return utils.typeText(itemToBuy, false);
                    //return timeout = 1;            
                }

                if (inputText == itemToBuy) {
                    //clickGeItem.click();
                    this.clickGeSearch();
                    // timeout = 1;            
                } else if (inputText != itemToBuy) {
                    geWindow.click();
                }
                return
            }
        }


        if (geItem === itemIDToBuy) {
            if (geItemCurrentPrice !== priceToBuy && inputType != 7) {
                setPrice.click();
                //   timeout = 1;
                return
            }
            if (geItemCurrentPrice !== priceToBuy && inputType == 7) {
                utils.typeText(priceToBuy, true);
                //   timeout = 1;
                return
            }
            if (geItemCurrentQuantity !== quantityToBuy && inputType != 7) {
                setQuantity.click();
                //  timeout = 1;
                return
            }
            if (geItemCurrentQuantity !== quantityToBuy && inputType == 7) {
                utils.typeText(quantityToBuy, true);
                //  timeout = 1;
                return
            }
            if (geItemCurrentQuantity === quantityToBuy && geItemCurrentPrice === priceToBuy) {
                geConfirm.click();
                //   timeout = 1;
                return
            }
        } else if (geItem != itemIDToBuy) {
            geWindow.click();
            return
        }
    }
}

function WorldHopper() {
    this.isLoggedIn = function() {
       return client.getGameState() == "LOGGED_IN";
    }
 
    this.isHopperOpen = function() {
       var hopperOpen = new Widget(4521989, 1, 57 -1);
 
       if (!hopperOpen.isVisible()) {
          client.openWorldHopper();
       } else {
          return true
       }    
    }
 
    this.closeHopper = function() {
       var close = new Widget(4521989, 1, 57, -1);
       return close.click();
    }
 
    this.getAus = function() {
       var worldList = client.getWorldList();
       var ausWorlds = [];
       if(worldList) {
          for(i = 0; i < worldList.length; i++) {
             if(worldList[i].getLocation() == 3
             && worldList[i] != client.getWorld()
             && worldList[i].getPlayerCount() <= 1000
             && worldList[i].getTypes().contains(net.runelite.api.WorldType.MEMBERS) 
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.FRESH_START_WORLD)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.DEADMAN)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.SKILL_TOTAL)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.HIGH_RISK)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.QUEST_SPEEDRUNNING)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.PVP_ARENA)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.PVP)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.LAST_MAN_STANDING)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.BOUNTY)) {
                ausWorlds.push(worldList[i]);
             }
          }
       }
       
       return ausWorlds;
    }
 
    this.getUsa = function() {
       var worldList = client.getWorldList();
       var usWorlds = [];
       if(worldList) {
          for(i = 0; i < worldList.length; i++) {
             if(worldList[i].getLocation() == 0
             && worldList[i] != client.getWorld()
             && worldList[i].getPlayerCount() <= 1000
             && worldList[i].getTypes().contains(net.runelite.api.WorldType.MEMBERS) 
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.FRESH_START_WORLD)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.DEADMAN)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.SKILL_TOTAL)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.HIGH_RISK)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.QUEST_SPEEDRUNNING)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.PVP_ARENA)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.PVP)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.LAST_MAN_STANDING)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.BOUNTY)) {
                usWorlds.push(worldList[i]);
             }
          }
       }
       
       return usWorlds;
    }
 
    this.getUk = function() {
       var worldList = client.getWorldList();
       var ukWorlds = [];
       if(worldList) {
          for(i = 0; i < worldList.length; i++) {
             if(worldList[i].getLocation() == 1
             && worldList[i] != client.getWorld()
             && worldList[i].getPlayerCount() <= 1000
             && worldList[i].getTypes().contains(net.runelite.api.WorldType.MEMBERS) 
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.FRESH_START_WORLD)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.DEADMAN)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.SKILL_TOTAL)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.HIGH_RISK)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.QUEST_SPEEDRUNNING)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.PVP_ARENA)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.PVP)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.LAST_MAN_STANDING)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.BOUNTY)) {
                ukWorlds.push(worldList[i]);
             }
          }
       }
       
       return ukWorlds;
    }
 
    this.getRandom = function() {
       var worldList = client.getWorldList();
       var worlds = [];
       if(worldList) {
          for(i = 0; i < worldList.length; i++) {
             if(worldList[i] != client.getWorld()
             && worldList[i].getPlayerCount() <= 1000
             && worldList[i].getTypes().contains(net.runelite.api.WorldType.MEMBERS) 
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.FRESH_START_WORLD)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.DEADMAN)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.SKILL_TOTAL)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.HIGH_RISK)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.QUEST_SPEEDRUNNING)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.PVP_ARENA)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.PVP)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.LAST_MAN_STANDING)
             && !worldList[i].getTypes().contains(net.runelite.api.WorldType.BOUNTY)) {
                worlds.push(worldList[i]);
             }
          }
       }
       
       return worlds;
    }
 }
 
 WorldHopper.prototype.hop = function(world) {
    var targetWorld = client.createWorld();
    if (this.isLoggedIn() && this.isHopperOpen()) {
       targetWorld.setId(world);
       return client.hopToWorld(targetWorld);
    }
 }
 
 
 WorldHopper.prototype.hopUsa = function() {
    if (this.isLoggedIn() && this.isHopperOpen()) {
       var worlds = this.getUsa();
       return client.hopToWorld(worlds[Math.floor(Math.random() * worlds.length)]);
    }
 }
 
 WorldHopper.prototype.hopUk = function() {
    if (this.isLoggedIn() && this.isHopperOpen()) {
       var worlds = this.getUk();
       return client.hopToWorld(worlds[Math.floor(Math.random() * worlds.length)]);
    }
 }
 
 WorldHopper.prototype.hopAus = function() {
    if (this.isLoggedIn() && this.isHopperOpen()) {
       var worlds = this.getAus();
       return client.hopToWorld(worlds[Math.floor(Math.random() * worlds.length)]);
    }
 }
 
 WorldHopper.prototype.hopRandom = function() {
    if (this.isLoggedIn() && this.isHopperOpen()) {
       var worlds = this.getRandom();
       return client.hopToWorld(worlds[Math.floor(Math.random() * worlds.length)]);
    }
 }

 function Prayer(selectedPrayer) {
    this.selectedPrayer = selectedPrayer;
    this.prayers = [
        { name: "AUGURY", level: 77, extraReq: true, enumPath: net.runelite.api.Prayer.AUGURY },
        { name: "BURST_OF_STRENGTH", level: 4, extraReq: false, enumPath: net.runelite.api.Prayer.BURST_OF_STRENGTH },
        { name: "CHIVALRY", level: 60, extraReq: true, enumPath: net.runelite.api.Prayer.CHIVALRY },
        { name: "CLARITY_OF_THOUGHT", level: 7, extraReq: false, enumPath: net.runelite.api.Prayer.CLARITY_OF_THOUGHT },
        { name: "EAGLE_EYE", level: 44, extraReq: false, enumPath: net.runelite.api.Prayer.EAGLE_EYE },
        { name: "HAWK_EYE", level: 26, extraReq: false, enumPath: net.runelite.api.Prayer.HAWK_EYE },
        { name: "IMPROVED_REFLEXES", level: 16, extraReq: false, enumPath: net.runelite.api.Prayer.IMPROVED_REFLEXES },
        { name: "INCREDIBLE_REFLEXES", level: 34, extraReq: false, enumPath: net.runelite.api.Prayer.INCREDIBLE_REFLEXES },
        { name: "MYSTIC_LORE", level: 27, extraReq: false, enumPath: net.runelite.api.Prayer.MYSTIC_LORE },
        { name: "MYSTIC_MIGHT", level: 45, extraReq: false, enumPath: net.runelite.api.Prayer.MYSTIC_MIGHT },
        { name: "MYSTIC_WILL", level: 9, extraReq: false, enumPath: net.runelite.api.Prayer.MYSTIC_WILL },
        { name: "PIETY", level: 70, extraReq: true, enumPath: net.runelite.api.Prayer.PIETY },
        { name: "PRESERVE", level: 55, extraReq: false, enumPath: net.runelite.api.Prayer.PRESERVE },
        { name: "PROTECT_FROM_MAGIC", level: 37, extraReq: false, enumPath: net.runelite.api.Prayer.PROTECT_FROM_MAGIC },
        { name: "PROTECT_FROM_MELEE", level: 43, extraReq: false, enumPath: net.runelite.api.Prayer.PROTECT_FROM_MELEE },
        { name: "PROTECT_FROM_MISSILES", level: 40, extraReq: false, enumPath: net.runelite.api.Prayer.PROTECT_FROM_MISSILES },
        { name: "PROTECT_ITEM", level: 25, extraReq: false, enumPath: net.runelite.api.Prayer.PROTECT_ITEM },
        { name: "RAPID_HEAL", level: 22, extraReq: false, enumPath: net.runelite.api.Prayer.RAPID_HEAL },
        { name: "RAPID_RESTORE", level: 19, extraReq: false, enumPath: net.runelite.api.Prayer.RAPID_RESTORE },
        { name: "REDEMPTION", level: 49, extraReq: false, enumPath: net.runelite.api.Prayer.REDEMPTION },
        { name: "RETRIBUTION", level: 46, extraReq: false, enumPath: net.runelite.api.Prayer.RETRIBUTION },
        { name: "RIGOUR", level: 74, extraReq: true, enumPath: net.runelite.api.Prayer.RIGOUR },
        { name: "ROCK_SKIN", level: 10, extraReq: false, enumPath: net.runelite.api.Prayer.ROCK_SKIN },
        { name: "SHARP_EYE", level: 8, extraReq: false, enumPath: net.runelite.api.Prayer.SHARP_EYE },
        { name: "SMITE", level: 52, extraReq: false, enumPath: net.runelite.api.Prayer.SMITE },
        { name: "STEEL_SKIN", level: 28, extraReq: false, enumPath: net.runelite.api.Prayer.STEEL_SKIN },
        { name: "SUPERHUMAN_STRENGTH", level: 13, extraReq: false, enumPath: net.runelite.api.Prayer.SUPERHUMAN_STRENGTH },
        { name: "THICK_SKIN", level: 1, extraReq: false, enumPath: net.runelite.api.Prayer.THICK_SKIN },
        { name: "ULTIMATE_STRENGTH", level: 31, extraReq: false, enumPath: net.runelite.api.Prayer.ULTIMATE_STRENGTH }
    ];

    this.targetPrayer = this.prayers.find(prayer => prayer.name === this.selectedPrayer);
    

    this.canUse = function () {
        var real = player.getRealSkill("prayer");
        var boosted = player.getBoostedSkill("prayer");

        if (this.selectedPrayer === "AUGURY" && client.getVarbitValue(5451) === 0) {
            return false
        }

        if (this.selectedPrayer === "RIGOUR" && client.getVarbitValue(5452) === 0) {
            return false
        }

        if (this.selectedPrayer === "PIETY" || this.selectedPrayer === "CHIVALRY" && client.getVarbitValue(3909) !== 8) {
            return false
        }

        if (boosted === 0) {
            return false
        }

        if (real < this.targetPrayer.level) {
            utils.message("Prayer level not high enough to use: " + this.selectedPrayer);
            return false
        }
        return true
    }
}

Prayer.prototype.togglePrayer = function () {
    if (!this.canUse()) {
        return
    }

    return api.togglePrayer(this.targetPrayer.enumPath, true);
    
}

Prayer.prototype.isActive = function () {
    return client.isPrayerActive(this.targetPrayer.enumPath);
}

function flickPrayers(prayers) {
    

    for (var prayer of prayers) {
        if (prayer.isActive()) {
            prayers.forEach(prayer => prayer.togglePrayer());
            return prayers.forEach(prayer => prayer.togglePrayer());
        }

        if (!prayer.isActive()) {
            prayer.togglePrayer();
            continue
        }
        return
    }
} 

function disablePrayers(prayers) {
    for (var prayer of prayers) {
        if (prayer.isActive()) {
            prayer.togglePrayer();
            continue
        }
        return
    }
} 

function depositInv() {
    var npc = new Npc(1634, "Bank");
    var all = new Widget(786474, 1, 57, -1);
    var equip = new Widget(786476, 1, 57, -1);
    var ge = new Navigation(3165, 3485, 0);

    if (!ge.playerNearPoint(15)) {
        return ge.webWalk();
    }

    if (!api.isBankOpen()) {
        return npc.click(5)
    }

    if (api.isBankOpen()) {
        if (!depositEquip) {
            equip.click()
            depositEquip = true;
            return timeout = 2;
        }

        all.click();
        depositInvent = true;
        return timeout = 2;
    }
}

function setShoppingList() {
    var npc = new Npc(1634, "Bank");

    if (!utils.isBankOpen()) {
        return npc.click(5);
    }

    if (!checkedBank) {
        for (var requiredItem of Object.values(requiredItems)) {
            shoppingItems.push(requiredItem);
        }

        if (isF2pQuest == true && utils.isMember()) {
            for (var membersItem of Object.values(membersItems)) {
                shoppingItems.push(membersItem);
            }
        }

        for (var j = shoppingItems.length - 1; j >= 0; j--) {
            var shoppingItem = shoppingItems[j];

            if (shoppingItem.bankContains()) {
                shoppingItems.splice(j, 1);
            }
        }
        checkedBank = true;
    }
}

function setInventory() {
    var npc = new Npc(1634, "Bank");
    var all = new Widget(786474, 1, 57, -1);
    var close = new Widget(786434, 1, 57, 11);

    if (!utils.isBankOpen()) {
        return npc.click(5);
    }

    if (!setupInventory) {
        if (!invSetDepsoit) {
            all.click()
            invSetDepsoit = true;
            return timeout = 2;
        }

        for (var requiredItem of Object.values(requiredItems)) {
            if (!requiredItem.haveLinkedItem()) {
                return requiredItem.withdraw();
            }
        }

        if (isF2pQuest == true && utils.isMember()) {
            for (var membersItem of Object.values(membersItems)) {
                if (!membersItem.haveLinkedItem()) {
                    return membersItem.withdraw();
                }
            }
        }
    }
    setupInventory = true;
    return close.click();
}

//Singletons
var utils = new Utils(true);
var grandExchange = new GrandExchange();
var worldHopper = new WorldHopper();
var player = new Player();