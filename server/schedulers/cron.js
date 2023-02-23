import cron from 'node-cron';

export const schedulerJob = cron.schedule('* * * * * *', function () {
    console.log('Hello world');
});