---
group:
  title: github流水线
  order: 3
order: 2
title: GitHub Action自动部署到服务器
nav:
  title: CICD
  order: 7
---


## 1、介绍
前面我们介绍到了GitHub配置流水线的yaml语法规则，在之前的开发中我们也能通过github流水线生成一个挂载在github上的页面，或者将页面同步到vercel上，这些功能让我们初步体验了流水线，不过很多情况下，git仓库只是一个载体，具体的代码我们还是要部署到自己的服务器上的，因此这个时候我们也是可以通过GitHub的Action将代码构建后发送到我们的服务器中去。

常见的做法是在GitHub Actions中通过SSH连接到服务器，然后执行git pull或者rsync等命令来同步代码。

rsync是一个功能强大的文件同步和传输工具，它可以在本地系统之间或本地与远程系统之间高效地同步文件和目录。rsync 只传输文件中发生变化的部分，因此非常高效。在部署代码的场景中，我们通常使用 rsync 将本地代码同步到远程服务器。它有很多有用的选项，例如：

+ -a：归档模式，保持文件属性，并递归同步目录。
+ -v：详细输出。
+ -z：传输时压缩。
+ --delete：删除目标目录中源目录没有的文件（保持两边一致）。
+ -e：指定远程 shell 程序（例如 ssh）。

例如：

```bash
rsync -avz --delete -e "ssh -p 22" ./ user@host:/path/to/target
```

这个命令会将当前目录（./）下的所有文件同步到远程服务器的 /path/to/target 目录，使用 SSH 连接，并且删除目标目录中源目录没有的文件。

在 GitHub Actions 中，我们可以通过步骤来设置 SSH 密钥，然后使用 rsync 命令同步文件。下面我们就来逐个介绍一下这些个方法。

其次还能通过scp进行传输，

## 2、服务器配置SSH秘钥及账号
不管我们使用什么方式将内容同步到服务器，都需要服务器配置相应的账号和秘钥，这里我们就登录我们的阿里云服务器进行配置：

首先可以创建专用部署用户：

```bash
# 创建新用户
sudo adduser deployer

# 或者创建无需密码登录的用户（更安全）
sudo useradd -m -s /bin/bash deployer

# 设置用户密码（可选，但建议设置）
sudo passwd deployer
```

```bash
[root@xxx ~]# sudo passwd deployer
Changing password for user deployer.
New password: 
Retype new password: 
passwd: all authentication tokens updated successfully.
```

这样我们就创建了一个用户为deployer，密码为@this2025，接着我们就为部署用户配置SSH目录：

```bash
# 切换到部署用户
sudo su - deployer

# 创建 .ssh 目录
mkdir -p ~/.ssh

# 设置正确的权限
chmod 700 ~/.ssh

# 创建 authorized_keys 文件
touch ~/.ssh/authorized_keys

# 设置正确的权限
chmod 600 ~/.ssh/authorized_keys

# 返回原来的用户
exit
```

注意这里我们使用的阿里云的控制面板，因此切换的时候需要重新进入，然后输入上面的用户和账号。

接着我们可以使用自己的本地电脑或者服务器生成一个SSH的秘钥对，这里为了方便我们测试秘钥于服务器是否能成功连接，就使用本地电脑生成：

```bash
# 生成密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# 按提示操作（可以直接回车跳过密码）
# 这会生成两个文件：
#   ~/.ssh/deploy_key      (私钥 - 保密！)
#   ~/.ssh/deploy_key.pub  (公钥 - 给服务器)
```

注意这里生成的秘钥需要使用无密码秘钥：

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key_nopass -N "" -C "github-actions-deploy"
Generating public/private rsa key pair.
Your identification has been saved in /Users/zhangjianhua/.ssh/deploy_key_nopass
Your public key has been saved in /Users/zhangjianhua/.ssh/deploy_key_nopass.pub
The key fingerprint is:
SHA256:odiCSib9t/c0+p2ENQPEdQkY6OOn1q1AvRTQOKHLQEk github-actions-deploy
The key's randomart image is:
+---[RSA 4096]----+
|   .E.  o*o+o... |
|   ..  .+o+  ..  |
|    . ....o      |
| . . = ooo o     |
|.oo o =.S.o +    |
|+. . . ....+ o   |
|.   . . .+=..    |
|     . .++.+..   |
|      .o.o+.o    |
+----[SHA256]-----+
```

接下来我们需要将公钥复制到服务器的authorized_keys文件中，这里有几种方法：

方法1：最简单的方法（如果服务器允许密码登录）：

```bash
# 在你的本地电脑执行：
ssh-copy-id -i ~/.ssh/deploy_key_nopass.pub deployer@你的服务器IP地址

# 示例：
ssh-copy-id -i ~/.ssh/deploy_key_nopass.pub deployer@123.45.67.89
```

方法 2：手动复制（如果 ssh-copy-id 不可用）：

```bash
# 1. 查看公钥内容
cat ~/.ssh/deploy_key_nopass.pub

# 2. 复制输出的内容（以 ssh-rsa 开头的一大串）

# 3. 登录到服务器（用 root 或你创建 deployer 时使用的账户）
ssh root@你的服务器IP地址

# 4. 切换到 deployer 用户
sudo su - deployer

# 5. 编辑 authorized_keys 文件
nano ~/.ssh/authorized_keys

# 6. 将你复制的公钥内容粘贴进去
# 7. 按 Ctrl+X，然后 Y，然后回车保存
# 8. 退出
exit
exit
```

测试 SSH 密钥登录：

```bash
# 在你的本地电脑测试：
ssh -i ~/.ssh/deploy_key_nopass deployer@你的服务器IP地址

# 示例：
ssh -i ~/.ssh/deploy_key_nopass deployer@123.45.67.89

# 如果成功，你会看到类似：
# Welcome to Ubuntu...
# deployer@server:~$
```

```bash
zhangjianhua@U-QCX2V1Y9-0238 ~ % ssh -i ~/.ssh/deploy_key_nopass deployer@8.1xxxxxx

Welcome to Alibaba Cloud Elastic Compute Service !

Updates Information Summary: available
    11 Security notice(s)
         5 Important Security notice(s)
         6 Moderate Security notice(s)
Run "dnf upgrade-minimal --security" to apply all updates.More details please refer to:
https://help.aliyun.com/document_detail/416274.html
Last failed login: Fri Dec 26 14:40:42 CST 2025 from 106.11.31.30 on ssh:notty
There were 3 failed login attempts since the last successful login.
Last login: Fri Dec 26 14:34:41 2025 from 106.11.31.30
```

这说明秘钥已经使用成功了。下一步就是在服务器上准备部署环境。在服务器上创建部署目录，这里我们就将我们的zjh-blog通过这种方式部署到我们服务器上：

```bash

# 登录到服务器后，创建部署目录
sudo mkdir -p /var/www/zjh-blog
sudo chown -R deployer:deployer /var/www/zjh-blog
sudo chmod -R 755 /var/www/zjh-blog

# 或者如果你希望将项目放在deployer用户的家目录下
mkdir -p /home/deployer/apps/zjh-blog
```

不过因为我们的deployer没有sudo权限，因此这里可以：

```bash
# 创建目录
mkdir -p /var/www/zjh-blog

# 更改目录所有者为 deployer 用户和组
chown -R deployer:deployer /var/www/zjh-blog

# 更改目录权限为 755（也可以根据你的需要设置）
chmod -R 755 /var/www/zjh-blog
```

```bash
# 测试 deployer 用户是否可以写入该目录
ssh -i ~/.ssh/deploy_key_nopass deployer@8xxxxx
cd /var/www/zjh-blog
touch test.txt
ls -la
```

验证没问题之后我们就可以来配置GitHub相关内容了。

## 3、实现自动化同步功能
### 3.1、使用SSH + scp(或rsync)
通过SSH连接到服务器，然后在服务器上执行git pull（要求服务器上已经克隆了仓库，并且配置了自动拉取）。前面我们已经给服务器创建好了公钥账号，下面我们就需要配置GitHub Secrets，将我们的内容放在GitHub的TARGET_PATH上，而不是直接在yml文件中写，避免私钥泄露：

配置 GitHub Secrets 的核心路径为：进入 GitHub 代码仓库 → Settings → Secrets and variables → Actions 。具体步骤如下：

1. 进入仓库设置：在你的 GitHub 仓库页面上方，点击 Settings 选项卡。
2. 找到 Secrets 配置项：在左侧边栏，找到 Secrets and variables 选项，然后点击其下的 Actions。
3. 创建新的 Secret：点击 New repository secret 按钮。
4. 填写信息并保存：
    - Name：输入 Secret 的名称（例如SSH_PRIVATE_KEY）。
    - Secret：粘贴对应的值（例如私钥文件的内容）。
    - 点击 Add secret 完成添加。

| Secret 名称 | 作用 | 值（示例） | 获取方式 |
| --- | --- | --- | --- |
| SSH_PRIVATE_KEY | 供 GitHub Actions登录你的服务器 | -----BEGIN RSA PRIVATE KEY-----... | 在本地终端执行cat ~/.ssh/deploy_key_nopass，复制全部输出内容。 |
| SERVER_HOST | 服务器的地址 | 8xxxx | 你的服务器公网 IP。 |
| SERVER_USER | 登录服务器的用户名 | deployer | 在服务器上创建的部署用户名。 |
| TARGET_PATH | 代码同步的目标路径 | /var/www/zjh-blog | 之前用root账户创建并授权给deployer的目录。 |


注意这里复制私钥的时候，需要复制整个内容：

```bash
-----BEGIN OPENSSH PRIVATE KEY-----   # 或 -----BEGIN RSA PRIVATE KEY-----
（中间所有行）
-----END OPENSSH PRIVATE KEY-----     # 或 -----END RSA PRIVATE KEY-----
```

不要只负责中间的内容，-----BEGIN OPENSSH PRIVATE KEY-----这些都要复制上去。

需要重复以上步骤，为自动化部署所需的所有敏感信息创建 Secret。
![](../images//cicd/cicd202512261500.png)

这样我们就将对应的秘钥都放在了github上，接着就是配置对应的流水线了：

```bash
name: Deploy to Server

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:  # 允许手动触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts

    - name: Test Connection
      run: |
        ssh -o BatchMode=yes ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "echo '✅ GitHub Actions SSH连接成功'"

    - name: Check Directory Access
      run: |
        ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "
          echo '检查部署目录...'
          cd ${{ secrets.TARGET_PATH }}
          touch test-access.txt && echo '✅ 目录可写' && rm test-access.txt
          echo '当前目录: $(pwd)'
          echo '用户: $(whoami)'
          echo '权限:'
          ls -la ${{ secrets.TARGET_PATH }}
        "

    - name: Deploy with rsync
      run: |
        echo "开始部署到 ${{ secrets.TARGET_PATH }}"
        rsync -avz \
          --exclude='.git' \
          --exclude='.github' \
          --exclude='node_modules' \
          --exclude='*.log' \
          --exclude='.env*' \
          --exclude='*.tmp' \
          --delete \
          ./ \
          ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:${{ secrets.TARGET_PATH }}/

    - name: Verify Deployment
      run: |
        ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "
          echo '=== 部署验证 ==='
          cd ${{ secrets.TARGET_PATH }}
          echo '当前目录: $(pwd)'
          echo '文件列表:'
          ls -la
          echo '目录大小: $(du -sh .)'
          echo '文件数量: $(find . -type f | wc -l)'
          echo '部署完成时间: $(date)'
        "
```

给我们的zjh-blog项目增加一个新的workflows配置，因为我们之前有deploy将内容部署到Github Page上，因此这里我们可以改之前的配置，也可以重新创建一个，这里我们因为都是为了部署，就放在一个文件中：

```bash
name: Deploy Docs to GitHub Pages & Server

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      - name: Install Dependencies
        run: pnpm install
      - name: Build Documentation Site
        run: pnpm run docs:build-site
      - name: Verify Build Output
        run: |
          if [ ! -d "dist" ]; then
            echo "❌ Build output directory 'dist' not found!"
            exit 1
          else
            echo "✅ Build output verified in dist/"
            ls -la dist/
          fi
      - name: Setup GitHub Pages
        uses: actions/configure-pages@v4
      - name: Upload Artifact for GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      # ============ 新增步骤：为服务器部署保留产物 ============
      - name: Upload Build Artifact for Server
        uses: actions/upload-artifact@v4
        with:
          name: site-dist
          path: dist/
          retention-days: 1

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

  # ============ 新增的 Job：部署到阿里云服务器 ============
  deploy-to-server:
    needs: build # 依赖于构建阶段
    runs-on: ubuntu-latest
    # 你可以调整这个并发组，使其与 `deploy` job 同时运行
    concurrency: deploy-to-server
    steps:
      # 1. 下载上一步构建好的产物
      - name: Download Build Artifact
        uses: actions/download-artifact@v4
        with:
          name: site-dist
          path: ./dist-to-deploy
      
      # 2. 配置 SSH 连接（使用之前设置的 Secrets）
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
      
      # 3. 使用 rsync 同步文件到服务器
      - name: Deploy to Server via rsync
        run: |
          echo "🚀 开始同步到服务器..."
          rsync -avz \
            --delete \
            ./dist-to-deploy/ \
            ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:${{ secrets.TARGET_PATH }}/
      
      # 4. 验证部署
      - name: Verify Server Deployment
        run: |
          echo "✅ 同步完成，验证部署..."
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "
            cd ${{ secrets.TARGET_PATH }}
            echo '部署完成时间: $(date)'
            echo '目录大小: $(du -sh .)'
          "
```

但是我们发现其中构建的时候会有好多问题，首先是因为输出的文件中有一些带有冒号，导致流水线失败，其次就是github下rsync安装后使用总有问题，因此最终改用scp进行传输，流水线代码如下：

```bash
name: Deploy Docs to GitHub Pages & Server

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      - name: Install Dependencies
        run: pnpm install
      - name: Build Documentation Site
        run: pnpm run docs:build-site
      - name: Clean Invalid Filenames
        run: |
          echo "🔧 清理文件名中的冒号..."
          find dist -depth -name '*:*' | while read item; do
            mv "$item" "$(echo "$item" | tr ':' '_')"
          done
          if find dist -name '*:*' | grep -q .; then
            echo "❌ 仍有包含冒号的文件"
            exit 1
          fi
      - name: Verify Build Output
        run: |
          if [ ! -d 'dist' ]; then
            echo '❌ Build output directory dist not found!'
            exit 1
          fi
      - name: Setup GitHub Pages
        uses: actions/configure-pages@v4
      - name: Upload Artifact for GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - name: Upload Build Artifact for Server
        uses: actions/upload-artifact@v4
        with:
          name: site-dist
          path: dist/
          retention-days: 1

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

  deploy-to-server:
    needs: build
    runs-on: ubuntu-latest
    concurrency: deploy-to-server
    steps:
      - name: Download Build Artifact
        uses: actions/download-artifact@v4
        with:
          name: site-dist
          path: ./dist-to-deploy

      - name: Verify Downloaded Files
        run: |
          echo '📦 已下载构建产物'
          echo "文件数量：$(find ./dist-to-deploy -type f | wc -l)"

      - name: Setup SSH Connection
        run: |
          mkdir -p ~/.ssh
          echo '${{ secrets.SSH_PRIVATE_KEY }}' > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H '${{ secrets.SERVER_HOST }}' >> ~/.ssh/known_hosts

      - name: Deploy with scp
        run: |
          echo '🚀 开始使用 scp 同步文件到服务器...'
          echo "目标路径：${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:${{ secrets.TARGET_PATH }}"

          # 1. 清理服务器目标目录（确保干净）
          echo '🧹 清理服务器目标目录...'
          ssh '${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}' "
            # 删除目标目录中的所有内容，但保留目录本身
            if [ -d '${{ secrets.TARGET_PATH }}' ]; then
              rm -rf '${{ secrets.TARGET_PATH }}'/*
              echo '✅ 目标目录已清空'
            else
              mkdir -p '${{ secrets.TARGET_PATH }}'
              echo '✅ 目标目录已创建'
            fi
          "

          # 2. 使用 scp 递归复制整个目录
          echo '📤 正在上传文件到服务器...'
          scp -r ./dist-to-deploy/* '${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:${{ secrets.TARGET_PATH }}/'

          echo '✅ 文件传输完成！'

          # 3. 验证传输结果
          echo '🔍 验证传输结果...'
          ssh '${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}' "
            echo '========== 传输验证 =========='
            echo '目标目录: ${{ secrets.TARGET_PATH }}'
            echo '传输的文件数量: \$(find ${{ secrets.TARGET_PATH }} -type f | wc -l)'
            echo '目录大小: \$(du -sh ${{ secrets.TARGET_PATH }})'
            echo '前5个文件:'
            find '${{ secrets.TARGET_PATH }}' -type f | head -5
            echo '=============================='
          "
      # =============================================
      - name: Final Server Verification
        run: |
          echo '🔍 最终服务器验证...'
          ssh '${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}' "
            echo '========== 最终验证 =========='
            echo '服务器时间: \$(date)'
            echo '部署目录: ${{ secrets.TARGET_PATH }}'
            echo '完整文件列表:'
            ls -la '${{ secrets.TARGET_PATH }}' | head -15
            echo '总文件数: \$(find ${{ secrets.TARGET_PATH }} -type f | wc -l)'
            echo '=============================='
          "

          echo '🎉 部署完成！'

```

### 3.2、使用SSH + Docker的方式
```bash
name: Build and Deploy Docker

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Build Docker image
      run: |
        docker build -t your-app .

    - name: Save Docker image
      run: docker save your-app -o your-app.tar

    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa

    - name: Copy and load on server
      run: |
        scp -P ${{ secrets.SERVER_PORT || 22 }} your-app.tar ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:/tmp/
        ssh -p ${{ secrets.SERVER_PORT || 22 }} ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} "
          docker load -i /tmp/your-app.tar
          docker-compose down
          docker-compose up -d
        "
```

可以看到这里也就是将我们的代码先通过docker save生成tar包，然后使用SSH连接服务器后，通过scp将tar包传到服务器，再使用docker进行运行。具体的流程就不逐个去写了。


