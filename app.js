const http = require('http')
const createHandler = require('github-webhook-handler')
const handler = createHandler({ path: '/webhook', secret: 'xxxxxxxx' })
const spawn = require('child_process').spawn;

handler.on('error', function (err) {
    console.error('Error:', err.message)
});

handler.on('push', event=> {
    try {
        const {repository,ref} = event.payload;
        const {full_name,name,private,size} = repository;
        const autoRun = ref === 'refs/heads/master';
        console.info(`
            - 接收到仓库:【${full_name}】的推送消息；
            - 修改分支：【${ref}】;
            - 仓库是否私有：${private};
            - 大小：【${size}】
            - 是否需要自动部署：${autoRun}】;
        `);

        // 判断是否需要自动部署
        if (!autoRun) {
            return
        }

        console.log('开始执行脚本');
        const s = spawn('sh', ['./bin/pull.sh']);
        s.stdout.on('data', (data) => {
          console.log(`${name}:${data}`);
        });
        s.stderr.on('data', (data) => {
          console.log(`${name}: ${data}`);
        });
        console.log('has rebuild');
    } catch (e) {
        console.log('build error',e)
    }
});

http.createServer( (req, res)=> {
    handler(req, res, function (err) {
        console.log('err',err);
        res.statusCode = 404
        res.end('no such location')
    });
}).listen(3001,()=>{
    console.log('running in http://127.0.0.1:3001/');
});