import React, { useState } from 'react';


function App() {
  // 修改数据结构：每个规则拥有自己的决策
  const [rules, setRules] = useState([
    {
      id: 1, 
      name: '规则1', 
      expression: 'age >= 18', 
      decisions: [
        {
          id: 1,
          name: '规则1决策',
          actions: [
            { type: 'SET', key: 'result', value: 'true', target: 'ML_DECISION' }
          ]
        }
      ]
    },
    {
      id: 2, 
      name: '规则2', 
      expression: 'age <= 18', 
      decisions: [
        {
          id: 2,
          name: '规则2决策',
          actions: [
            { type: 'SET', key: 'result', value: 'false', target: 'ML_DECISION' },
            { type: 'INCR', key: 'key', value: 'Value' }
          ]
        }
      ]
    }
  ]);

  const [testInput, setTestInput] = useState('{ "age": 28 }');
  const [testResult, setTestResult] = useState(null);
  const [showTestResult, setShowTestResult] = useState(false);
  
  // 拖拽相关状态
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [resultTrace, setResultTrace] = useState([]);

  // 更新规则表达式
  const handleRuleExpressionChange = (id, value) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, expression: value } : rule
    ));
  };

  // 更新规则名称
  const updateRuleName = (id, name) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, name } : rule
    ));
  };

  // 处理动作变更
  const handleActionChange = (ruleId, decisionId, actionIndex, field, value) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const updatedDecisions = rule.decisions.map(decision => {
          if (decision.id === decisionId) {
            const updatedActions = [...decision.actions];
            updatedActions[actionIndex] = { ...updatedActions[actionIndex], [field]: value };
            return { ...decision, actions: updatedActions };
          }
          return decision;
        });
        return { ...rule, decisions: updatedDecisions };
      }
      return rule;
    }));
  };

  // 添加新的决策动作
  const addNewDecisionAction = (ruleId, decisionId) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const updatedDecisions = rule.decisions.map(decision => {
          if (decision.id === decisionId) {
            return { 
              ...decision, 
              actions: [...decision.actions, { type: 'SET', key: '', value: '', target: 'ML_DECISION' }]
            };
          }
          return decision;
        });
        return { ...rule, decisions: updatedDecisions };
      }
      return rule;
    }));
  };

  // 删除决策动作
  const deleteDecisionAction = (ruleId, decisionId, actionIndex) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const updatedDecisions = rule.decisions.map(decision => {
          if (decision.id === decisionId) {
            if (decision.actions.length <= 1) {
              alert('至少需要保留一个动作');
              return decision;
            }
            const updatedActions = [...decision.actions];
            updatedActions.splice(actionIndex, 1);
            return { ...decision, actions: updatedActions };
          }
          return decision;
        });
        return { ...rule, decisions: updatedDecisions };
      }
      return rule;
    }));
  };

  // 添加新的决策项
  const addNewDecision = (ruleId) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        const newDecisionId = Math.max(...rule.decisions.map(d => d.id), 0) + 1;
        return { 
          ...rule, 
          decisions: [...rule.decisions, {
            id: newDecisionId,
            name: `决策${newDecisionId}`,
            actions: [{ type: 'SET', key: '', value: '', target: 'ML_DECISION' }]
          }]
        };
      }
      return rule;
    }));
  };

  // 删除决策项
  const deleteDecision = (ruleId, decisionId) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        // 确保至少保留一个决策项
        if (rule.decisions.length > 1) {
          return { 
            ...rule, 
            decisions: rule.decisions.filter(d => d.id !== decisionId)
          };
        }
      }
      return rule;
    }));
  };

  // 处理测试输入变更
  const handleTestInputChange = (e) => {
    setTestInput(e.target.value);
  };

  // 运行测试
  const runTest = () => {
    try {
      const input = JSON.parse(testInput);
      const results = rules.map(rule => {
        try {
          // 使用eval执行规则表达式，实际生产环境应使用更安全的方式
          const age = input.age;
          const balance = input.balance || 0;
          const score = input.score || 0;
          const hasBadRecord = input.hasBadRecord || false;
          const level = input.level || '';
          const points = input.points || 0;
          
          // 处理level字符串比较
          const processedExpression = rule.expression.replace(/level\s*==\s*([A-Z]+)/g, (match, p1) => `level == '${p1}'`);
          const isMatch = eval(processedExpression);
          
          return { 
            ruleName: rule.name, 
            expression: rule.expression, 
            matched: isMatch,
            decision: isMatch ? rule.decisions[0].actions : []
          };
        } catch (error) {
          return { 
            ruleName: rule.name, 
            expression: rule.expression, 
            matched: false,
            error: error.message
          };
        }
      });
      
      // 生成测试轨迹
      const trace = results.map(result => ({
        ruleName: result.ruleName,
        expression: result.expression,
        passed: result.matched,
        result: result.matched ? '通过' : result.error ? `错误: ${result.error}` : '未通过'
      }));
      
      // 找到第一个匹配的规则结果
      const firstMatch = results.find(result => result.matched);
      const finalResult = firstMatch ? '规则命中' : '未命中任何规则';
      
      setTestResult({ results, finalResult });
      setResultTrace(trace);
      setShowTestResult(true);
    } catch (error) {
      alert('输入JSON格式错误: ' + error.message);
    }
  };

  // 添加新规则
  const addNewRule = () => {
    const newId = Math.max(...rules.map(r => r.id)) + 1;
    setRules([...rules, { 
      id: newId, 
      expression: '', 
      name: `规则${newId}`,
      decisions: [
        {
          id: newId,
          name: `规则${newId}决策`,
          actions: [
            { type: 'SET', key: '', value: '', target: 'ML_DECISION' }
          ]
        }
      ]
    }]);
  };

  // 删除规则
  const handleDeleteRule = (id) => {
    if (rules.length <= 1) {
      alert('至少需要保留一条规则');
      return;
    }
    setRules(rules.filter(rule => rule.id !== id));
  };

  // 复制规则
  const handleCopyRule = (id) => {
    const ruleToCopy = rules.find(rule => rule.id === id);
    if (!ruleToCopy) return;
    
    const newId = Math.max(...rules.map(r => r.id)) + 1;
    const newRule = {
      ...ruleToCopy,
      id: newId,
      name: `${ruleToCopy.name} (复制)`,
      decisions: ruleToCopy.decisions.map(decision => ({
        ...decision,
        id: newId,
        name: `${decision.name} (复制)`
      }))
    };
    
    setRules([...rules, newRule]);
  };

  // 拖拽相关函数
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (sourceIndex !== targetIndex) {
      const newRules = [...rules];
      const [movedRule] = newRules.splice(sourceIndex, 1);
      newRules.splice(targetIndex, 0, movedRule);
      setRules(newRules);
    }
    
    setDraggedIndex(null);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>规则组：规则组1</h1>
        <div className="header-actions">
          <button className="btn btn-secondary">取消</button>
          <button className="btn btn-secondary">确定</button>
          <button className="btn btn-primary">保存并启用</button>
        </div>
      </div>

      <div className="rule-editor">
        <div className="section-title">规则与决策管理</div>
        
        {/* 四列表格布局 */}
        <div className="table-container">
          <table className="decision-table">
            <thead>
              <tr>
                <th className="table-column serial-column">序号</th>
                <th className="table-column rule-column">规则列</th>
                <th className="table-column decision-column">决策列</th>
                <th className="table-column action-column">操作列</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, index) => (
                <tr
                  key={rule.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="table-row"
                >
                            {/* 序号列 */}
                            <td className="serial-cell">
                              <div className="serial-number">{index + 1}</div>
                            </td>
                            
                            {/* 规则列 */}
                            <td className="rule-cell">
                              <div className="rule-section">
                                <div className="rule-item">
                                  {/* 规则名编辑 */}
                                  <div className="rule-name-container">
                                    <span className="rule-prefix">新规则</span>
                                    <input
                                      type="text"
                                      className="rule-name"
                                      value={rule.name}
                                      onChange={(e) => updateRuleName(rule.id, e.target.value)}
                                      placeholder="规则名"
                                    />
                                  </div>
                                  {/* 规则表达式编辑 */}
                                  <input
                                    type="text"
                                    className="rule-expression"
                                    value={rule.expression}
                                    onChange={(e) => handleRuleExpressionChange(rule.id, e.target.value)}
                                    placeholder="输入规则表达式，例如：age >= 18"
                                  />
                                </div>
                              </div>
                            </td>
                            
                            {/* 决策列 */}
                            <td className="decision-cell">
                              <div className="decision-section">
                                {rule.decisions.map((decision) => (
                                  <div key={decision.id} className="decision-item">
                                    <div className="decision-header">
                                      <span className="decision-type">{decision.name}</span>
                                      <div className="decision-actions">
                                        <button 
                                          className="btn btn-small btn-danger"
                                          onClick={() => deleteDecision(rule.id, decision.id)}
                                          disabled={rule.decisions.length <= 1}
                                        >
                                          删除决策
                                        </button>
                                      </div>
                                    </div>
                                    <div className="action-list">
                                      {decision.actions.map((action, idx) => (
                                        <div key={idx} className="action-row">
                                          <select
                                            className="action-select"
                                            value={action.target}
                                            onChange={(e) => handleActionChange(rule.id, decision.id, idx, 'target', e.target.value)}
                                          >
                                            <option value="ML_DECISION">ML_DECISION</option>
                                          </select>
                                          <select
                                            className="action-select"
                                            value={action.type}
                                            onChange={(e) => handleActionChange(rule.id, decision.id, idx, 'type', e.target.value)}
                                          >
                                            <option value="SET">SET</option>
                                            <option value="INCR">INCR</option>
                                          </select>
                                          <input
                                            type="text"
                                            className="action-input"
                                            value={action.key}
                                            onChange={(e) => handleActionChange(rule.id, decision.id, idx, 'key', e.target.value)}
                                            placeholder="key"
                                          />
                                          <input
                                            type="text"
                                            className="action-input"
                                            value={action.value}
                                            onChange={(e) => handleActionChange(rule.id, decision.id, idx, 'value', e.target.value)}
                                            placeholder="value"
                                          />
                                          <button 
                                            className="btn btn-small btn-danger"
                                            onClick={() => deleteDecisionAction(rule.id, decision.id, idx)}
                                          >
                                            删除动作
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    <button 
                                      className="btn btn-small btn-secondary"
                                      onClick={() => addNewDecisionAction(rule.id, decision.id)}
                                    >
                                      + 添加动作
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </td>
                            
                            {/* 操作列 */}
                            <td className="action-cell">
                              <div className="row-actions">
                                <button className="btn btn-small btn-secondary" onClick={() => handleCopyRule(rule.id)}>复制规则</button>
                                <button className="btn btn-small btn-danger" onClick={() => handleDeleteRule(rule.id)}>删除规则</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
        </div>
        
        <button className="btn btn-secondary" onClick={addNewRule}>
          + 添加规则
        </button>
      </div>

      <div className="test-section">
        <div className="section-title">测试</div>
        <textarea
          className="test-input"
          value={testInput}
          onChange={handleTestInputChange}
          placeholder='输入测试数据，例如：{ "age": 28 }'
        ></textarea>
        <button className="btn btn-primary" onClick={runTest}>
          运行测试
        </button>
        
        {testResult && (
          <div className="test-results">
            <h3>测试结果</h3>
            {testResult.results.map((result, index) => (
              <div key={index} className="result-item">
                <div>
                  <span className="result-label">规则:</span>
                  <span className="result-value">{result.ruleName}</span>
                </div>
                <div>
                  <span className="result-label">表达式:</span>
                  <span className="result-value">{result.expression}</span>
                </div>
                <div>
                  <span className="result-label">匹配结果:</span>
                  <span className="result-value">{result.matched ? 'true' : 'false'}</span>
                </div>
                {result.error && (
                  <div>
                    <span className="result-label">错误:</span>
                    <span className="result-value">{result.error}</span>
                  </div>
                )}
                {result.decision && (
                  <div>
                    <span className="result-label">执行决策:</span>
                    <span className="result-value">
                      {JSON.stringify(result.decision, null, 2)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;