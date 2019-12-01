# Resumable Upload

Implentation of pausing and resuming of File upload.

### Requirements

1. node and npm
2. Docker
3. Kubernetes

### Commands

1. Start
```
kubectl run my-app --image=imidiotic/resume-upload --port=8080
kubectl expose deployment my-app --type=LoadBalancer --port=8080 --target-port=8080
```
2. Check
```
kubectl get pods
kubectl get svc
```
3. update
```
kubectl set image deployment/my-app  my-app=imidiotic/resume-upload
```
4. Clean Up
```
kubectl delete deployment my-app
kubectl delete svc my-app
```

go to [external ip]:8080
