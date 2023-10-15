import pickle
import random
import json
import pandas as pd
import datetime
from geopy.distance import geodesic

PROCESSING_RATE = 100

def predict_flow_rate(date:int) -> int:
    with open('trained_model.pkl', 'rb') as file:
        model = pickle.load(file)
        new_data = pd.DataFrame({
            'x': [date]
        })
        return(model.predict(new_data)[0])
    
def random_office_queue() -> int:
    return random.randint(0,20)

def get_offices() -> dict:
    with open('static/resources/offices.json', 'r', encoding='utf-8') as file:
        offices = json.load(file)
    return offices

def get_offices_by_provided_service(office_type: str, service: str) -> dict:
    all = get_offices()
    return all

def calculate_distance(user_coords: list, office: list) -> float:
    office_coords = [office["latitude"], office["longitude"]]
    distance = geodesic(user_coords, office_coords).kilometers
    return distance

def choose_nearest_offices(user_coords: list, office_list: list) -> list:
    for office in office_list:
        office['distance'] = calculate_distance(user_coords, office)
    sorted_by_distance = sorted(office_list, key=lambda office: office["distance"])
    return sorted_by_distance[:3]

def calculate_wait_time(lmb: float, mu: float) -> int:
    workload = lmb/mu
    if workload == 1:
        workload = 0.99
    if lmb == 0:
        return 0
    wait_time = workload*workload/(lmb*(1-workload))
    return wait_time

def wait_time_for_office_now(office:dict) -> int:
    wait_time = random_office_queue()/PROCESSING_RATE
    return wait_time

def wait_time_for_office_predict(office: dict, time: int) -> int:
    flow_rate = predict_flow_rate(time)
    wait_time = calculate_wait_time(flow_rate, PROCESSING_RATE)
    return wait_time

