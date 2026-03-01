#!/usr/bin/env node

// Santi Channel 自动部署脚本
// 将插件部署到OpenClaw插件目录

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始部署 Santi Channel 插件...');

// 配置
const PLUGIN_NAME = 'santi-channel';
const OPENCLAW_PLUGINS_DIR = path.join(process.env.HOME, '.openclaw', 'plugins');
const PLUGIN_TARGET_DIR = path.join(OPENCLAW_PLUGINS_DIR, PLUGIN_NAME);
const CURRENT_DIR = process.cwd();

// 检查OpenClaw插件目录
if (!fs.existsSync(OPENCLAW_PLUGINS_DIR)) {
    console.log(`📁 创建OpenClaw插件目录: ${OPENCLAW_PLUGINS_DIR}`);
    fs.mkdirSync(OPENCLAW_PLUGINS_DIR, { recursive: true });
}

// 复制插件文件
console.log(`📦 复制插件文件到: ${PLUGIN_TARGET_DIR}`);

// 确保目标目录存在
if (fs.existsSync(PLUGIN_TARGET_DIR)) {
    console.log('🗑️  清理旧版本...');
    fs.rmSync(PLUGIN_TARGET_DIR, { recursive: true, force: true });
}

fs.mkdirSync(PLUGIN_TARGET_DIR, { recursive: true });

// 需要复制的文件
const filesToCopy = [
    'package.json',
    'index.js',
    'manifest.json',
    'README.md'
];

// 需要复制的目录
const dirsToCopy = [
    'lib',
    'scripts'
];

// 复制文件
filesToCopy.forEach(file => {
    const source = path.join(CURRENT_DIR, file);
    const target = path.join(PLUGIN_TARGET_DIR, file);
    
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, target);
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ⚠️  ${file} (不存在)`);
    }
});

// 复制目录
dirsToCopy.forEach(dir => {
    const source = path.join(CURRENT_DIR, dir);
    const target = path.join(PLUGIN_TARGET_DIR, dir);
    
    if (fs.existsSync(source)) {
        copyDir(source, target);
        console.log(`  ✅ ${dir}/`);
    } else {
        console.log(`  ⚠️  ${dir}/ (不存在)`);
    }
});

// 安装依赖
console.log('📦 安装插件依赖...');
try {
    execSync('npm install', { 
        cwd: PLUGIN_TARGET_DIR,
        stdio: 'inherit'
    });
} catch (error) {
    console.log('⚠️  依赖安装失败，请手动运行: npm install');
}

// 重启OpenClaw Gateway
console.log('🔄 重启OpenClaw Gateway...');
try {
    execSync('openclaw gateway restart', { stdio: 'inherit' });
    console.log('✅ OpenClaw Gateway已重启');
} catch (error) {
    console.log('⚠️  无法重启OpenClaw Gateway，请手动运行: openclaw gateway restart');
}

console.log('\n🎉 部署完成!');
console.log('📋 下一步:');
console.log('  1. 启动sChat客户端: cd schat && npm start');
console.log('  2. 访问 http://localhost:8080');
console.log('  3. 开始聊天!');

// 辅助函数：复制目录
function copyDir(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    
    const items = fs.readdirSync(source);
    
    items.forEach(item => {
        const sourcePath = path.join(source, item);
        const targetPath = path.join(target, item);
        
        const stat = fs.statSync(sourcePath);
        
        if (stat.isDirectory()) {
            copyDir(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}