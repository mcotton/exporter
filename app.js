var kue = require('kue'),
    jobs = kue.createQueue(),
    u = require('underscore'),
    exec = require('child_process').exec,
    config = require('./config.js'),
    een = require('./een.js')


startUp = function(body) {
    een.getVideoList({'c': config.camera, 'start': '20150120000000.000', 'end': '20150126000000.000' }, processVideoList)
}

processVideoList = function(res, body) {
    //console.log('running processVideoList')
    //console.log('dumping body object')
    //console.log(body)
    //console.log('status code: ' + res.statusCode)
    try {
        if(body) {
            //console.log('about to parse videoList')
            var videos = JSON.parse(body)
            //console.log('dumping videos object')
            //console.log(videos)
            //console.log('start creating jobs from videoList')
            u.each(videos, function(item, count) {
                var job = jobs.create('download', {
                        's': item.s,
                        'e': item.e,
                        'count': count,
                        'title': item.s
                    }).save(function(err) { 
                        if(err) { console.error('error saving job') } 
                        if(!err) { 
                            console.log('created a job and saved as: ' + job.id) 
                        } 
                    })

                job.on('complete', function(result){
                    console.log("Job completed with data ", result);
                }).on('failed', function(){
                    console.log("Job failed");
                }).on('progress', function(progress){
                    process.stdout.write('\r  job #' + job.id + ' ' + progress + '% complete');
                })
            })
            
            // start processing the job queue, five at a time
            jobs.process('download', 5, worker)

        } else {
            console.error('videoList is not an object, quiting')
        }
    } catch(e) {
        console.log('failed to parse videoList')
        process.exit()
    }
}


worker = function(job, done) {
    console.log('job id: ' + job.id + ' is doing work');
    var curl_cmd = ['curl', ' ',
                    '--cookie', ' ',
                   '"videobank_sessionid=',
                    /videobank_sessionid=(\w*);/.exec(een.cookie_jar._jar.store.idx['eagleeyenetworks.com']['/']['videobank_sessionid'])[1], '" ',
                    '"https://login.eagleeyenetworks.com/asset/play/video.flv?id=', config.camera,
                    '&start_timestamp=', job.data.s,
                    '&end_timestamp=', job.data.e,
                    '&" > ',
                    job.data.s, '.flv'
                   ].join('')
    var child = exec(curl_cmd, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
        done()
    });
}


jobs.on('job enqueue', function(id,type){
  console.log( 'job %s got queued', id );
});

jobs.on('job complete', function(id,result){
  kue.Job.get(id, function(err, job){
    if (err) return;
    job.remove(function(err){
      if (err) throw err;
      console.log('removed completed job #%d', job.id);
    });
  });
});


kue.app.listen(3000)

een.login({'username': config.username, 'password': config.password }, startUp, function() { console.log('failed to login') })



