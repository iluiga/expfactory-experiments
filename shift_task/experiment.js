
/* ************************************ */
/* Define helper functions */
/* ************************************ */

var randomDraw = function(lst) {
    var index = Math.floor(Math.random()*(lst.length))
    return lst[index]
}

var getData = function() {
  return {rewarded_feature: rewarded_feature, rewarded_dim: rewarded_dim, trials_since_switch: switch_count, total_points: total_points, trial_num: current_trial}
}

var getAlert = function() {
  return '<div class = centerbox><div class = center-text>The important feature is <strong>' + rewarded_feature + '</strong>!</div></div>'
}
var getStim = function() {
  var colors = jsPsych.randomization.shuffle(stim_att.colors)
  var shapes = jsPsych.randomization.shuffle(stim_att.shapes)
  var patterns = jsPsych.randomization.shuffle(stim_att.patterns)
  stim_htmls = []
  stims = []
  for (var i = 0; i < 3; i++) {
    stim_htmls.push(path_source + colors[i] + '_' + shapes[i] + '_' + patterns[i] + '.png')
    stims.push({color: colors[i], shape: shapes[i], pattern: patterns[i]})
  }
  return '<div class = shift_left><img class = shift_stim src = ' + stim_htmls[0] + ' width = "50%" </img></div>' + 
        '<div class = shift_middle><img class = shift_stim src = ' + stim_htmls[1] + ' width = "50%"  </img></div>' + 
        '<div class = shift_right><img class = shift_stim src = ' + stim_htmls[2] + ' width = "50%"  </img></div>'
}

var getFeedback = function() {
  var last_trial = jsPsych.data.getLastTrialData()
  var position_array = ['shift_left', 'shift_middle', 'shift_right']
  var choice = choices.indexOf(last_trial.key_press)
  jsPsych.data.addDataToLastTrial({stims: JSON.stringify(stims), choice: JSON.stringify(stims[choice])})
  if (choice != -1) {
    var image = '<div class = ' + position_array[choice] + '><img class = shift_stim src = ' + stim_htmls[choice] + ' width = "50%" </img></div>'
    var feedback_text = 'You won 0 points.'
    if (image.indexOf(rewarded_feature) != -1 && Math.random() > .25) {
        feedback_text = 'You won 1 point!'
    } else if (image.indexOf(rewarded_feature) == -1 && Math.random() <= .25) {
        feedback_text = 'You won 1 point!'
    }
  } else {
    image = last_trial.stimulus
    feedback_text = 'Respond faster!'
  }
  return image + '<div class = shift_feedback_box><p class = center-text>' + feedback_text + '</p></div>'
}


/* ************************************ */
/* Define experimental variables */
/* ************************************ */
var choices = [37, 40, 39] 
var current_trial = 0
var exp_len = 410
var practice_len = 90
var total_points = 0 //tracks points earned during test

// stim variables
var stim_att = {
  colors: ['red','blue','green'],
  shapes: ['circle','square','triangle'],
  patterns: ['dots','lines','waves']
}
var stim_htmls = [] //array of stim html
var stims = [] //array of stim objects
var dims = ['colors', 'shapes', 'patterns']
var features = stim_att.colors.concat(stim_att.shapes).concat(stim_att.patterns)
var path_source = 'static/experiments/shift_task/images/'
var rewarded_dim = randomDraw(dims)
var rewarded_feature = randomDraw(stim_att[rewarded_dim])

// variables to track feature switch
var last_dim = ''
var last_feature = ''
var switch_count = 0 //when switch_count equals switch_bound the feature switches
var switch_bounds = jsPsych.randomization.repeat([16,17,18,19,20,21,22,23,24,25],2)
var num_switches = switch_bounds.length
/* controls how often the shift is extra-dimensional (across dims) vs intra (across features within a dim) */
var shift_types = jsPsych.randomization.repeat(['extra','extra','intra','reversal'], num_switches/4)
while (shift_types[0] == 'reversal') {
  var ran_i = Math.floor(Math.random()*(num_switches-1))+1
  var tmp = shift_types[ran_i]
  shift_types[ran_i] = shift_types[0]
  shift_types[0] = tmp
}
// Add on practice switches/shifts
switch_bounds.unshift(25, 24, 16, 25)
shift_types.unshift('extra','intra','extra','intra') 

// set first shift_type/switch_bound
var shift_type = shift_types.shift() 
var switch_bound = switch_bounds.shift() //set first switch_bound

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
/* define static blocks */
var welcome_block = {
  type: 'text',
  text: '<div class = centerbox><p class = block-text>Welcome to the shift experiment. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: 13,
  timing_post_trial: 0
};

var end_block = {
  type: 'text',
  text: '<div class = centerbox><p class = center-block-text>Finished with this task.</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: 13,
  timing_post_trial: 0
};

var instructions_block = {
  type: 'instructions',
  pages: ['<div class = instructionbox><p class = block-text>On each trial of this experiment three patterned objects will be presented. They will differ in their color, shape and internal pattern.</p><p class = block-text>For instance, the objects may look something like this:</p></div>' + getStim(),
  '<div class = centerbox><p class = block-text>On each trial you select one of the objects to get points using the arrow keys (left, down and right keys for the left, middle and right objects, respectively). The object you choose determines the chance of getting a point.</p><p class = block-text>The objects differ in three dimensions: their color (red, blue, green), shape (square, circle, triangle) and pattern (lines, dots, waves). Only one dimension (color, shape or pattern) is relevant for determining the probability of winning a point at any time.</p><p class = block-text>One feature of that dimension will result in rewards more often than the others. For instance, if the relevant dimension is "color", "blue" objects may result in earning a point more often than "green" or "red" objects.</p><p class = block-text>Importantly, all rewards are probabilistic. This means that even the best object will sometimes not result in any points and bad objects can sometimes give points.</div>', 
  '<div class = centerbox><p class = block-text>The relevant dimension and feature can change between trials. One trial "color" may be the relevant dimension with "red" the relevant feature, while on the next trial "pattern" is the important dimension with "waves" the important feature.</p><p class = block-text>During an initial practice session these changes will be explicitly signaled and you will be told what the relevant feature is. During the main task, however, there will be no explicit instructions - you will have to figure out the important feature yourself.</p><p class = block-text>Your objective is to get as many point as possible! The trials go by quickly so you must respond quickly. This task is fairly long (should take ~ 20 minutes) so there will be a number of breaks throughout. We will start with a practice session.'],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var start_practice_block = {
  type: 'text',
  text: '<div class = centerbox><p class = shift-center-text>We will now start practice. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: 13,
  timing_post_trial: 1000
};

var start_test_block = {
  type: 'text',
  text: '<div class = centerbox><p class = shift-center-text>We will now start the test. You will no longer be told what the important feature is or when it switches. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: 13,
  timing_post_trial: 1000
};

var rest_block = {
  type: 'text',
  text: '<div class = centerbox><p class = shift-center-text>Take a break! Press <strong>enter</strong> to continue.</p></div>',
  cont_key: 13,
  timing_post_trial: 1000
};

var reset_block = {
  type: 'call-function',
  func: function() {
    current_trial = 0
    switch_count = 0
    rewarded_dim = randomDraw(dims)
    rewarded_feature = randomDraw(stim_att[rewarded_dim])
  },
  timing_post_trial: 0
}

//Create chunk to alert subject that shift happens during practice
var alert_block = {
  type: 'single-stim',
  stimuli: getAlert,
  is_html: true,
  choices: 'none',
  timing_stim: 2000,
  timing_response: 2000,
  timing_post_trial: 1000
};

var alert_chunk = {
  chunk_type: 'if',
  timeline: [alert_block],
  conditional_function: function() {
    if (switch_count == 0) {
      return true
    } else { return false}
  }
}
/* define test block */
var practice_stim_block = {
  type: 'single-stim',
  stimuli: getStim,
  is_html: true,
  data: getData,
  choices: choices,
  timing_stim: 1000,
  timing_response: 1000,
  timing_post_trial: 0,
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({exp_id: "shift", trial_id: "practice_stim"})
  }
};

var stim_block = {
  type: 'single-stim',
  stimuli: getStim,
  is_html: true,
  data: getData,
  choices: choices,
  timing_stim: 1000,
  timing_response: 1000,
  timing_post_trial: 0,
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({exp_id: "shift", trial_id: "stim"})
  }
};

var practice_feedback_block = {
  type: 'single-stim',
  stimuli: getFeedback,
  is_html: true,
  data: getData,
  choices: 'none',
  timing_stim: 1000,
  timing_response: 1000,
  timing_post_trial: 500,
  on_finish: function(data) {
    var FB = 0
    if (data.stimulus.indexOf('won 1 point') != -1) {
      total_points += 1
      var FB = 1
    }
    jsPsych.data.addDataToLastTrial({exp_id: "shift", trial_id: "practice_feedback", FB: FB})
    switch_count += 1
    if (switch_count == switch_bound) {
      switch_count = 0
      if (shift_type == 'extra') {
        last_dim = rewarded_dim
        last_feature = rewarded_feature
        rewarded_dim = randomDraw(dims.filter(function(x){return x!=rewarded_dim}))
        rewarded_feature = randomDraw(stim_att[rewarded_dim])
      } else if (shift_type == 'intra') {
        var dim_features = stim_att[rewarded_dim]
        last_feature = rewarded_feature
        rewarded_feature = randomDraw(dim_features.filter(function(x){return x!= rewarded_feature}))
      } else if (shift_type == 'reversal') {
          rewarded_dim = last_dim
          rewarded_feature = last_feature
      }
      switch_bound = switch_bounds.shift()
      shift_type = shift_types.shift()
    }
    current_trial += 1
  }
};

var feedback_block = {
  type: 'single-stim',
  stimuli: getFeedback,
  is_html: true,
  data: getData,
  choices: 'none',
  timing_stim: 1000,
  timing_response: 1000,
  timing_post_trial: 500,
  on_finish: function(data) {
    var FB = 0
    if (data.stimulus.indexOf('won 1 point') != -1) {
      var FB = 1
    }
    jsPsych.data.addDataToLastTrial({exp_id: "shift", trial_id: "practice_feedback", FB: FB})
    switch_count += 1
    if (switch_count == switch_bound) {
      switch_count = 0
      switch_bound = switch_bounds.shift()
      if (shift_type == 'extra') {
        last_dim = rewarded_dim
        last_feature = rewarded_feature
        rewarded_dim = randomDraw(dims.filter(function(x){return x!=rewarded_dim}))
        rewarded_feature = randomDraw(stim_att[rewarded_dim])
      } else if (shift_type == 'intra') {
        var dim_features = stim_att[rewarded_dim]
        last_feature = rewarded_feature
        rewarded_feature = randomDraw(dim_features.filter(function(x){return x!= rewarded_feature}))
      } else if (shift_type == 'reversal') {
          rewarded_dim = last_dim
          rewarded_feature = last_feature
      }
      shift_type = shift_types.shift()
    }
    current_trial += 1
  }
};

/* create experiment definition array */
var shift_task_experiment = [];
shift_task_experiment.push(welcome_block);
shift_task_experiment.push(instructions_block);
shift_task_experiment.push(start_practice_block);
for (var i = 0; i < practice_len; i++) {
  shift_task_experiment.push(alert_chunk)
  shift_task_experiment.push(practice_stim_block);
  shift_task_experiment.push(practice_feedback_block);
}
shift_task_experiment.push(reset_block);
shift_task_experiment.push(start_test_block);
for (var i = 0; i < exp_len; i++) {
  shift_task_experiment.push(stim_block);
  shift_task_experiment.push(feedback_block);
  if (i%(Math.floor(exp_len/4)) == 0 && i != 0) {
    shift_task_experiment.push(rest_block)
  }
}
shift_task_experiment.push(end_block);