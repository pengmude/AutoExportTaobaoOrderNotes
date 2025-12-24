(function () {
    // =============== 第一步：提取订单编号和商品名称 ===============
    const orderIdElements = document.querySelectorAll('.shopInfoOrderId--CVDgDEO2');
    const orderIds = Array.from(orderIdElements).map(el => {
        const text = el.innerText.trim();
        const match = text.match(/\d+/);
        return match ? match[0] : text;
    });

    const titleElements = document.querySelectorAll('.titleText--W0CIPGbq');
    const titles = Array.from(titleElements).map(el => el.innerText.trim());

    const count = Math.min(orderIds.length, titles.length);
    if (count === 0) {
        alert('未找到订单编号或商品名称，请确保页面已完全加载！');
        return;
    }

    console.log(`🔍 共有 ${count} 条订单待处理，开始自动提取备注...`);

    // =============== 第二步：批量提取备注（自动模拟悬停） ===============
    const remarkButtons = document.querySelectorAll('.orderRemark--mmB3XP7Q');
    const actualRemarkCount = Math.min(count, remarkButtons.length); // 防止越界

    // 工具函数：提取单个备注
    function extractRemark(btn) {
        return new Promise((resolve) => {
            // 触发悬停
            const event = new MouseEvent('mouseover', { bubbles: true });
            btn.dispatchEvent(event);

            // 延迟读取
            setTimeout(() => {
                const remarkEl = document.querySelector('.ant-popover-inner-content [class*="remarkDetail"]');
                const text = remarkEl ? remarkEl.innerText.trim() : '';
                resolve(text);
            }, 250);
        });
    }

    // =============== 第三步：主流程（异步处理） ===============
    (async () => {
        const remarks = [];
        for (let i = 0; i < actualRemarkCount; i++) {
            console.log(`⏳ 正在提取第 ${i + 1} 条订单的备注...`);
            const remark = await extractRemark(remarkButtons[i]);
            remarks.push(remark);
        }

        // 补齐长度（如果备注按钮少于订单数）
        while (remarks.length < count) {
            remarks.push('');
        }

        // =============== 第四步：合并三列数据 ===============
        const orders = [];
        for (let i = 0; i < count; i++) {
            orders.push({
                '订单编号': orderIds[i],
                '商品名称': titles[i],
                '备注': remarks[i]
            });
        }

        // =============== 第五步：生成 CSV ===============
        const headers = ['订单编号', '商品名称', '备注'];
        const csvContent = [
            headers.join(','),
            ...orders.map(row =>
                `"${row['订单编号'].replace(/"/g, '""')}", "${row['商品名称'].replace(/"/g, '""')}", "${row['备注'].replace(/"/g, '""')}"`
            )
        ].join('\n');

        // =============== 第六步：生成中文时间文件名 ===============
        const now = new Date();
        const filename = `订单数据_${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日${now.getHours()}时${now.getMinutes()}分${now.getSeconds()}秒.csv`;

        // =============== 第七步：下载文件 ===============
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // =============== 完成提示 ===============
        console.table(orders);
        alert(`✅ 成功导出 ${orders.length} 条订单（含备注）！\n文件名：${filename}`);
    })();
})();