// FileName: groups.js
// Description: Definitions for roup management:
// create, join, leave, and delete groups.

//Imports
const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const Medication = require('../models/Medication');
const auth = require('../middleware/auth');
const router = express.Router();

//Create a new group
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.group) {
      return res.status(400).json({ msg: 'User already in a group' });
    }
    const newGroup = new Group({
      name: `${user.username}'s Family Group`, 
      members: [req.user.userId], // The creator is the first member
    });
    const group = await newGroup.save();
    user.group = group.id;
    await user.save();
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//Join an existing group using an invite code
router.post('/join', auth, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const user = await User.findById(req.user.userId);
    if (user.group) {
      return res.status(400).json({ msg: 'User already in a group' });
    }
    const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    group.members.push(req.user.userId);
    user.group = group.id;
    await group.save();
    await user.save();
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//Leaving a group.
router.post('/leave', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('group');
    if (!user || !user.group) {
      return res.status(400).json({ msg: 'User is not in a group' });
    }
    const group = user.group;
    group.members.pull(req.user.userId);
    user.group = undefined;
    if (group.members.length === 0) {
      await Medication.deleteMany({ group: group._id });
      await group.deleteOne();
    } else {
      await group.save();
    }
    await user.save();
    res.json({ msg: 'Successfully left the group' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Deleting a group.
router.delete('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const groupId = user.group;
    if (!groupId) {
      return res.status(400).json({ msg: 'User is not in a group' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(404).json({ msg: 'Group not found' });
    }

    
    // Check if user making the request is first member 
    if (group.members[0].toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Authorization denied: Only the group owner can delete the group.' });
    }

    // Delete group data
    await Medication.deleteMany({ group: groupId });
    // Remove group from members
    await User.updateMany({ group: groupId }, { $unset: { group: 1 } });
    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.json({ msg: 'Group and all associated data deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//Exporting
module.exports = router;