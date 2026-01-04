import React, { useState } from 'react';

function App() {
  const [rules, setRules] = useState([
    { id: 1, expression: 'age >= 18', name: 'New Rule 1' },
    { id: 2, expression: 'age <= 18', name: 'New Rule 2' }
  ]);

  const [decisions, setDecisions] = useState([
    { 
      id: 1, 
      name: '执行结果',
      actions: [
        { type: 'SET', key: 'result', value: 'false', target: 'ML_DECISION' },
        { type: 'INCR', key: 'key', value: 'Value' }
      ]
    },
    { 
      id: 2, 
      name: '规则命中',
      actions: [
        { type: 'SET', key: 'result', value: 'true', target: 'ML_DECISION' }
      ]
    }
  ]);

  const [testInput, setTestInput] = useState('{ "age": 28 }');
  const [testResult, setTestResult] = useState(null);

  const handleRuleExpressionChange = (id, value) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, expression: value } : rule
    ));
  };

  const handleActionChange = (decisionId, actionIndex, field, value) => {
    setDecisions(decisions.map(decision => {
      if (decision.id === decisionId) {
        const updatedActions = [...decision.actions];
        updatedActions[actionIndex] = { ...updatedActions[actionIndex], [field]: value };
        return { ...decision, actions: updatedActions };
      }
      return decision;
    }));
  };

  const handleTestInputChange = (e) => {
    setTestInput(e.target.value);
  };

  const runTest = () => {
    try {
      const input = JSON.parse(testInput);
      const results = rules.map(rule => {
        try {
          // 改进的规则表达式执行
          let isMatch = false;
          
          // 安全地解析和执行简单表达式
          if (rule.expression.includes('>=')) {
            const [field, value] = rule.expression.split('>=');
            isMatch = input[field.trim()] >= Number(value.trim());
          } else if (rule.expression.includes('<=')) {
            const [field, value] = rule.expression.split('<=');
            isMatch = input[field.trim()] <= Number(value.trim());
          } else if (rule.expression.includes('==')) {
            const [field, value] = rule.expression.split('==');
            isMatch = input[field.trim()] == value.trim().replace(/'/g, '');
          } else if (rule.expression.includes('>')) {
            const [field, value] = rule.expression.split('>');
            isMatch = input[field.trim()] > Number(value.trim());
          } else if (rule.expression.includes('<')) {
            const [field, value] = rule.expression.split('<');
            isMatch = input[field.trim()] < Number(value.trim());
          } else if (rule.expression.includes('!=')) {
            const [field, value] = rule.expression.split('!=');
            isMatch = input[field.trim()] != value.trim().replace(/'/g, '');
          }
          
          return { 
            ruleName: rule.name, 
            expression: rule.expression, 
            matched: isMatch,
            decision: isMatch ? decisions[1].actions : decisions[0].actions
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
      setTestResult(results);
    } catch (error) {
      alert('输入JSON格式错误: ' + error.message);
    }
  };

  const addNewRule = () => {
    const newId = Math.max(...rules.map(r => r.id)) + 1;
    setRules([...rules, { 
      id: newId, 
      expression: '', 
      name: `New Rule ${newId}` 
    }]);
  };

  const addNewDecisionAction = (decisionId) => {
    setDecisions(decisions.map(decision => {
      if (decision.id === decisionId) {
        return { 
          ...decision, 
          actions: [...decision.actions, { type: 'SET', key: '', value: '', target: 'ML_DECISION' }]
        };
      }
      return decision;
    }));
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
        <div className="rule-section">
          <div className="section-title">规则</div>
          <div className="rule-list">
            {rules.map((rule) => (
              <div key={rule.id} className="rule-item">
                <input
                  type="text"
                  className="rule-expression"
                  value={rule.expression}
                  onChange={(e) => handleRuleExpressionChange(rule.id, e.target.value)}
                  placeholder="输入规则表达式，例如：age >= 18"
                />
                <button className="btn btn-small btn-secondary">编辑</button>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={addNewRule}>
            + 添加规则
          </button>
        </div>

        <div className="decision-section">
          <div className="section-title">执行决策</div>
          <div className="decision-list">
            {decisions.map((decision) => (
              <div key={decision.id} className="decision-item">
                <div className="decision-header">
                  <span className="decision-type">{decision.name}</span>
                  <button className="btn btn-small btn-secondary">编辑</button>
                </div>
                <div className="action-list">
                  {decision.actions.map((action, index) => (
                    <div key={index} className="action-row">
                      <select
                        className="action-select"
                        value={action.target}
                        onChange={(e) => handleActionChange(decision.id, index, 'target', e.target.value)}
                      >
                        <option value="ML_DECISION">ML_DECISION</option>
                      </select>
                      <select
                        className="action-select"
                        value={action.type}
                        onChange={(e) => handleActionChange(decision.id, index, 'type', e.target.value)}
                      >
                        <option value="SET">SET</option>
                        <option value="INCR">INCR</option>
                      </select>
                      <input
                        type="text"
                        className="action-input"
                        value={action.key}
                        onChange={(e) => handleActionChange(decision.id, index, 'key', e.target.value)}
                        placeholder="key"
                      />
                      <input
                        type="text"
                        className="action-input"
                        value={action.value}
                        onChange={(e) => handleActionChange(decision.id, index, 'value', e.target.value)}
                        placeholder="value"
                      />
                      <button className="btn btn-small btn-secondary">+ 冒</button>
                      <button className="btn btn-small btn-secondary">编辑</button>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn btn-small btn-secondary"
                  onClick={() => addNewDecisionAction(decision.id)}
                >
                  + 添加动作
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="test-section">
        <div className="section-title">测试</div>
        <textarea
          className="test-input"
          value={testInput}
          onChange={handleTestInputChange}
          placeholder="输入测试数据，例如：{ \"age\": 28 }"
        ></textarea>
        <button className="btn btn-primary" onClick={runTest}>
          运行测试
        </button>
        
        {testResult && (
          <div className="test-results">
            <h3>测试结果</h3>
            {testResult.map((result, index) => (
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