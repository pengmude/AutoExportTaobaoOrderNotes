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

    // =============== 第二步：批量提取并清洗备注（修复版） ===============
    const remarkButtons = document.querySelectorAll('.orderRemark--mmB3XP7Q');
    const actualRemarkCount = Math.min(count, remarkButtons.length);

    function extractRemark(btn) {
        return new Promise((resolve) => {
            // 尝试触发 mouseleave 清除旧 tooltip（可选但推荐）
            const leaveEvent = new MouseEvent('mouseleave', { bubbles: true });
            btn.dispatchEvent(leaveEvent);

            // 触发 mouseover 显示当前 tooltip
            const overEvent = new MouseEvent('mouseover', { bubbles: true });
            btn.dispatchEvent(overEvent);

            // 延迟 400ms 确保 tooltip 渲染完成
            setTimeout(() => {
                // 获取所有 remarkDetail 元素，取最后一个（最新渲染的）
                const allRemarkEls = document.querySelectorAll('.ant-popover-inner-content [class*="remarkDetail"]');
                const lastEl = allRemarkEls.length > 0 ? allRemarkEls[allRemarkEls.length - 1] : null;

                let text = lastEl ? lastEl.innerText.trim() : '';
                // 去掉“留言:”前缀（兼容空格）
                text = text.replace(/^留言:\s*/, '');
                resolve(text);
            }, 400); // 关键：足够延迟
        });
    }

    // =============== 第三步：主流程（串行处理） ===============
    (async () => {
        const remarks = [];
        for (let i = 0; i < actualRemarkCount; i++) {
            console.log(`⏳ 正在提取第 ${i + 1} 条订单的备注...`);
            const remark = await extractRemark(remarkButtons[i]);
            remarks.push(remark);
        }
        // 补齐无备注按钮的订单
        while (remarks.length < count) {
            remarks.push('');
        }

        // =============== 第四步：生成 CSV（无双引号，逗号转中文）===============
        const headers = ['订单编号', '商品名称', '备注'];
        const csvContent = [
            headers.join(','),
            ...Array.from({ length: count }, (_, i) =>
                `${orderIds[i]},${titles[i].replace(/,/g, '，')},${remarks[i].replace(/,/g, '，')}`
            )
        ].join('\n');

        // =============== 第五步：生成中文时间文件名 ===============
        const now = new Date();
        const filename = `订单数据_${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日${now.getHours()}时${now.getMinutes()}分${now.getSeconds()}秒.csv`;

        // =============== 第六步：下载文件 ===============
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // =============== 第七步：完成提示 ===============
        const preview = Array.from({ length: count }, (_, i) => ({
            '订单编号': orderIds[i],
            '商品名称': titles[i],
            '备注': remarks[i]
        }));
        console.table(preview);
        alert(`✅ 成功导出 ${count} 条订单！\n文件名：${filename}`);
    })();
})();