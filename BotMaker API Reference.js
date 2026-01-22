// CORE METHODS
bot.clearGameChat() // Clear game chat
bot.localPlayerIdle() // Check if local player is idle
bot.localPlayerIdleFor(ticks) // Check if local player is idle for amount of ticks
bot.localPlayerMoving() // Check if local player is moving
bot.menuAction(p0, p1, action, identifier, itemId, 'option', 'target') // Perform menu action
bot.printGameMessage('message') // Print message to game chat
bot.printLogMessage('message') // Print message to script log
bot.runClientScript(ints) // Run client script with integer array
bot.terminate() // Terminate the bot

// BANK METHODS
bot.bank.close() // Close the bank
bot.bank.consumeIds(ids) // Consume items with IDs
bot.bank.consumeNames(names) // Consume items with names
bot.bank.depositAll() // Deposit all items in inventory
bot.bank.depositAllWithId(id) // Deposit all items with specific ID
bot.bank.depositAllWithName('name') // Deposit all items with specific name
bot.bank.depositWithId(id) // Deposit item with specific ID
bot.bank.depositWithName('name') // Deposit item with specific name
bot.bank.getNotedMode() // Get bank noted mode status
bot.bank.getQuantityOfAllIds(itemIds) // Get quantity of all items with specified IDs
bot.bank.getQuantityOfAllNames(itemNames) // Get quantity of all items with specified names
bot.bank.getQuantityOfId(itemId) // Get quantity of item with specific ID
bot.bank.getQuantityOfName('itemName') // Get quantity of item with specific name
bot.bank.isBanking() // Check if currently banking
bot.bank.isOpen() // Check if bank is open
bot.bank.open() // Open the bank
bot.bank.setNotedMode(value) // Set bank noted mode
bot.bank.withdrawAllWithId(id) // Withdraw all items with specific ID
bot.bank.withdrawAllWithName('name') // Withdraw all items with specific name
bot.bank.withdrawQuantityWithId(id, quantity) // Withdraw specific quantity of item with ID
bot.bank.withdrawWithId(id) // Withdraw item with specific ID
bot.bank.withdrawWithName('name') // Withdraw item with specific name

// BM CACHE METHODS
bot.bmCache.getBoolean('key', defaultValue) // Get boolean from BM cache
bot.bmCache.getInt('key', defaultValue) // Get integer from BM cache
bot.bmCache.getString('key', 'defaultValue') // Get string from BM cache
bot.bmCache.saveBoolean('key', value) // Save boolean to BM cache
bot.bmCache.saveInt('key', value) // Save integer to BM cache
bot.bmCache.saveString('key', 'value') // Save string to BM cache

// BREAK HANDLER METHODS
bot.breakHandler.setBreakHandlerStatus(status) // Set break handler status

// COUNTERS METHODS
bot.counters.getCounter('name') // Get counter value
bot.counters.setCounter('name', value) // Set counter value

// EQUIPMENT METHODS
bot.equipment.containsAllIds(ids) // Check if equipment contains all items with IDs
bot.equipment.containsAllNames(names) // Check if equipment contains all items with names
bot.equipment.containsAnyIds(ids) // Check if equipment contains any items with IDs
bot.equipment.containsAnyNames(names) // Check if equipment contains any items with names
bot.equipment.containsId(id) // Check if equipment contains item with ID
bot.equipment.containsName('name') // Check if equipment contains item with name
bot.equipment.getEquipment() // Get equipment array
bot.equipment.unequip(id) // Unequips specific item

// EVENTS METHODS
bot.events.post(event) // Post an event to the bus
bot.events.register(clazz, subFn, priority) // Register an event subscriber
bot.events.unregister(object) // Unregister an event subscriber
bot.events.unregisterAll() // Unregister all event handlers

// GRAND EXCHANGE METHODS
bot.grandExchange.addBuyToQueue(itemId, quantity, walkToAndOpenGE) // Add buy order to Grand Exchange queue
bot.grandExchange.getExchangeQueueSize() // Get Grand Exchange queue size
bot.grandExchange.getFreeSlots() // Get free Grand Exchange slots
bot.grandExchange.isExchanging() // Check if Grand Exchange is exchanging
bot.grandExchange.isOpen() // Check if Grand Exchange is open

// GRAPHICS OBJECTS METHODS
bot.graphicsObjects.getWithIds(ids) // Get graphics objects with IDs

// INVENTORY METHODS
bot.inventory.containsAllIds(ids) // Check if inventory contains all items with IDs
bot.inventory.containsAllNames(names) // Check if inventory contains all items with names
bot.inventory.containsAnyIds(ids) // Check if inventory contains any items with IDs
bot.inventory.containsAnyNames(names) // Check if inventory contains any items with names
bot.inventory.containsId(id) // Check if inventory contains item with ID
bot.inventory.containsName('name') // Check if inventory contains item with name
bot.inventory.getEmptySlots() // Get number of empty inventory slots
bot.inventory.getQuantityOfAllIds(itemIds) // Get quantity of all items with specified IDs
bot.inventory.getQuantityOfAllNames(itemNames) // Get quantity of all items with specified names
bot.inventory.getQuantityOfId(itemId) // Get quantity of item with ID
bot.inventory.getQuantityOfName('itemName') // Get quantity of item with name
bot.inventory.interactAtIndex(index, options) // Interact with inventory item by index
bot.inventory.interactWithIds(itemIds, options) // Interact with inventory items by IDs
bot.inventory.interactWithNames(itemNames, options) // Interact with inventory items by names
bot.inventory.itemOnItemWithIds(itemId1, itemId2) // Use item on another item by IDs
bot.inventory.itemOnLastItemWithIds(itemId1, lastItemId2) // Use item on last inventory item by IDs
bot.inventory.itemOnNpcWithIds(itemId, npc) // Use item on NPC by ID
bot.inventory.itemOnObjectWithIds(itemId, tileObject) // Use item on object by ID
bot.inventory.itemOnPlayerWithIds(itemId, player) // Use item on player by ID
bot.inventory.itemOnPlayerWithNames(itemNames, playerNames) // Use item on player by names
bot.inventory.isFull() // Check if inventory is full
bot.inventory.getAllWidgets() // Get all inventory widgets

// NET METHODS
bot.net.sendMessage(targetIds, 'message', includeSelf) // Send message via net
bot.net.sendMessageToLocalPlayers('message', includeSelf) // Send message to local players
bot.net.sendMessageToRsns(rsNames, 'message', includeSelf) // Send message to specific player

// NOTIFIER METHODS
bot.notifier.sendMessage('message') // Send notification message

// NPC METHODS
bot.npcs.getAnimationID(npc) // Get NPC animation ID
bot.npcs.getAttackSpeed(npcId) // Get NPC attack speed
bot.npcs.getClosest(npcs) // Get closest NPC from array
bot.npcs.getClosestWithin(npcs, maxDistance) // Get closest NPC within distance
bot.npcs.getHeadIcon(npc) // Get NPC head icon
bot.npcs.getWithIds(ids) // Get NPCs with specific IDs
bot.npcs.getWithNames(names) // Get NPCs with specific names
bot.npcs.interact('npcName', 'action') // Interact with NPC by name
bot.npcs.interactSupplied(target, 'action') // Interact with supplied NPC
bot.npcs.isNearIds(ids, distance) // Check if NPCs with IDs are near
bot.npcs.isNearNames(names, distance) // Check if NPCs with names are near

// OBJECT METHODS
bot.objects.getClosest(tileObjects) // Get closest object from array
bot.objects.getClosestWithin(tileObjects, maxDistance) // Get closest object within distance
bot.objects.getTileObjectComposition(objectId) // Get tile object composition
bot.objects.getTileObjectsWithIds(ids) // Get tile objects with specific IDs
bot.objects.getTileObjectsWithNames(names) // Get tile objects with specific names
bot.objects.getTileObjectsWithOptions(options) // Get tile objects with specific options
bot.objects.interactObject('objectName', 'action') // Interact with object by name
bot.objects.interactObjects(objectNames, actions) // Interact with objects by names
bot.objects.interactSuppliedObject(target, 'action') // Interact with supplied object
bot.objects.isNearIds(ids, distance) // Check if objects with IDs are near
bot.objects.isNearNames(names, distance) // Check if objects with names are near

// PLAYER METHODS
bot.players.attackPlayer(names) // Attack player by names
bot.players.followPlayer(names) // Follow player by names
bot.players.isNearPlayer(radius, names) // Check if near player
bot.players.tradePlayer(names) // Trade with player by names

// PLUGINS METHODS
bot.plugins.questHelper.getCurrentQuestName() // Get current quest name
bot.plugins.questHelper.getNextItem() // Get next quest item
bot.plugins.questHelper.getNextItemOnItem() // Get next item on item action
bot.plugins.questHelper.getNextNpc() // Get next quest NPC
bot.plugins.questHelper.getNextTileObject() // Get next quest tile object
bot.plugins.questHelper.getNextWidget() // Get next quest widget
bot.plugins.questHelper.getNextWorldPoint() // Get next quest world point
bot.plugins.questHelper.getOverlayText() // Get quest helper overlay text
bot.plugins.questHelper.isQuestStarted() // Check if quest is started
bot.plugins.questHelper.performNextStep() // Perform next quest step

// PRAYER METHODS
bot.prayer.togglePrayer(prayer, bypassMouseClicks) // Toggle prayer

// PROJECTILE METHODS
bot.projectiles.getProjectilesWithIds(ids) // Get projectiles with IDs

// TILE ITEM METHODS
bot.tileItems.getItemsOfValue(value) // Get tile items of value
bot.tileItems.getItemsWithIds(ids) // Get tile items with IDs
bot.tileItems.getItemsWithNames(names) // Get tile items with names
bot.tileItems.lootItem(tileItemInfo) // Loot specific tile item
bot.tileItems.lootItemsOfValue(value, maxDistance) // Loot items of value within distance
bot.tileItems.lootItemsWithIds(lootIds, maxDistance) // Loot items with IDs within distance
bot.tileItems.lootItemsWithNames(lootNames, maxDistance) // Loot items with names within distance

// VARIABLE METHODS
bot.variables.getBooleanVariable('variableName') // Get boolean variable
bot.variables.getIntArrayVariable('variableName') // Get integer array variable
bot.variables.getIntVariable('variableName') // Get integer variable
bot.variables.getStringArrayVariable('variableName') // Get string array variable
bot.variables.getStringVariable('variableName') // Get string variable
bot.variables.setVariable('variableName', value) // Set variable value

// WALKING METHODS
bot.walking.getWebWalkCalculatedPath() // Get web walk calculated path
bot.walking.isRlplWebWalking() // Check if RLPL web walking
bot.walking.isRunning() // Check if player is running
bot.walking.isWebWalking() // Check if web walking
bot.walking.toggleRun() // Toggle run mode
bot.walking.walkToTrueWorldPoint(x, y) // Walk to true world point
bot.walking.walkToWorldPoint(x, y) // Walk to world point
bot.walking.webWalkCancel() // Cancel web walking
bot.walking.webWalkStart(worldPoint) // Start web walking to world point
bot.walking.webWalkStartWithConfig(worldPoint, eatFood, useStamina, runEnergyMin, useTransports, useTeleports, useEquipmentJewellery, useMinigameTeleports, avoidWilderness, usePoh, useCharterShips) // Starts walking with config flags
bot.walking.webWalkToNearestBank() // Walks to colests bank

// MAGIC METHODS
bot.magic.cast('spellName') // Cast magic spell
bot.magic.cast('spellName', actionIndex) // Cast magic spell with action index
bot.magic.castOnInventoryItemId('spellName', itemId) // Cast spell on inventory item by ID
bot.magic.castOnInventoryItemName('spellName', 'itemName') // Cast spell on inventory item by name
bot.magic.castOnNpc('spellName', npc) // Cast magic spell on NPC
bot.magic.castOnPlayer('spellName', player) // Cast magic spell on player
bot.magic.castOnTileItem('spellName', tileItem) // Cast magic spell on tile item
bot.magic.castOnTileObject('spellName', tileObject) // Cast magic spell on tile object

// WIDGET METHODS
bot.widgets.enableSpecialAttack() // Enables special attack bar
bot.widgets.handleDialogue(dialogues) // Handle dialogue interactions
bot.widgets.interactSpecifiedWidget(packedWidgetId, identifier, opcode, param0) // Interact with specified widget
bot.widgets.interactSpecifiedWidget(packedWidgetId, identifier, opcode, param0, param1) // Interact with specified widget with param1
bot.widgets.interactWidgetText('text') // Interact with widget text

// ATTACK STYLE METHODS
bot.attackStyle.setStyle(attackStyle) // Set current attack style IDs

// BM GLOBAL CACHE METHODS
bot.bmGlobalCache.getBoolean('key', defaultValue) // Get boolean from global BM cache
bot.bmGlobalCache.getInt('key', defaultValue) // Get integer from global BM cache
bot.bmGlobalCache.getString('key', 'defaultValue') // Get string from global BM cache
bot.bmGlobalCache.saveBoolean('key', value) // Save boolean to global BM cache
bot.bmGlobalCache.saveInt('key', value) // Save integer to global BM cache
bot.bmGlobalCache.saveString('key', 'value') // Save string to global BM cache

// TASK METHODS
bot.task.create() // Create a new bot task instance

// WEB METHODS
bot.web.readImage(requestURL)
bot.web.readString('url') // Read string from whitelisted URL

// ACCOUNT MAKER METHODS
bot.accountMaker.getCurrentObjective() // Grabs current object
bot.accountMaker.getCurrentTask() // Gets current task

// SAILING METHODS
bot.sailing.convertToMainWorld(boatWorldPoint) // Converts sailing point to main world point
bot.sailing.getBoatAngle() // Gets boat angle according to world point
bot.sailing.getBoatHeading() // Gets boat direction according to world point
bot.sailing.getBoatMainWorldLocation() // Gets boat main world location
bot.sailing.getBoatMainWorldLocationFloats() // Gets world point flaot
bot.sailing.getMovementSpeed() // Gets movement speed of boat
bot.sailing.getPlayerMainWorldLocation() // Gets players main world location while sailing
bot.sailing.isBoatMoving() // Check if boat is moving
bot.sailing.isOnBoat() // Checks if player is on boat
bot.sailing.isReversing() // Checks if boat is isReversing
bot.sailing.isSailingControlsAvailable() // Checks if boat controls are availible for moving the boat
bot.sailing.isSailsSet() // Checks if sails are currently set
bot.sailing.lowerSpeed() // Lowers boat speed
bot.sailing.raiseSpeed() // Raises boat speed
bot.sailing.reverse() // Sets boat to reverse
bot.sailing.setHeading(direction) // Sets direction to sail boat
bot.sailing.setSails() // Sets sails for boat
bot.sailing.setSailsObject() // Sets sail object for boat
bot.sailing.stopBoat() // Stops the boat
bot.sailing.unsetSails() // Unsets sails on boat

// SHOP METHODS
bot.shop.buy(itemId, quantity) // Buys item/quantity from shop
bot.shop.getIndex(itemId) // Gets item id from shop
bot.shop.getStock(itemId) // Gets item stock from shop
bot.shop.has(itemId, quantity) // Checks if item has the item + stock
bot.shop.isOpen() // Check is shop is open