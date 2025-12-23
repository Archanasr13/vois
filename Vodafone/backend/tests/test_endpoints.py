import json
import os
import pytest
from app import app, seed_database


@pytest.fixture(scope='module')
def client():
    # Ensure DB seeded
    seed_database()
    app.config['TESTING'] = True
    with app.test_client() as c:
        yield c


def test_analytics_endpoint(client):
    rv = client.get('/api/analytics/behavior')
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'total_clicks' in data
    assert 'improvement_trend' in data


def test_simulate_attack_and_submit(client):
    rv = client.get('/api/simulate_attack')
    assert rv.status_code == 200
    sim = rv.get_json()
    assert 'id' in sim

    payload = {'user_id': 1, 'simulation_id': sim['id'], 'action_taken': 'safe'}
    rv2 = client.post('/api/submit_interaction', data=json.dumps(payload), content_type='application/json')
    assert rv2.status_code == 200
    res = rv2.get_json()
    assert 'is_correct' in res
