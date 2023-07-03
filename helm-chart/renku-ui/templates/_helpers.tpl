{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "ui.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "ui-server.name" -}}
{{- printf "%sserver" (include "ui.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "ui.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "ui-server.fullname" -}}
{{- printf "%sserver" (include "ui.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ui.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Define URL protocol.
*/}}
{{- define "ui.protocol" -}}
{{- if .Values.global.useHTTPS -}}
https
{{- else -}}
http
{{- end -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "ui-server.labels" -}}
app.kubernetes.io/name: {{ include "ui-server.name" . }}
helm.sh/chart: {{ include "ui.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Hack for calling templates in a fake scope (until this is solved https://github.com/helm/helm/issues/3920)
*/}}
{{- define "call-nested" }}
{{- $dot := index . 0 }}
{{- $subchart := index . 1 }}
{{- $template := index . 2 }}
{{- include $template (dict "Chart" (dict "Name" $subchart) "Values" (index $dot.Values $subchart) "Release" $dot.Release "Capabilities" $dot.Capabilities) }}
{{- end }}

{{/*
Return the appropriate apiVersion for autoscaling.
*/}}
{{- define "autoscaling.apiVersion" -}}
{{- if semverCompare ">1.23-0" .Capabilities.KubeVersion.GitVersion -}}
{{- print "autoscaling/v2" -}}
{{- else -}}
{{- print "autoscaling/v2beta2" -}}
{{- end -}}
{{- end -}}

{{/*
Template a json list of cookies that should not be stripped by the ui-server proxy
*/}}
{{- define "ui-server.keepCookies" -}}
{{- $cookieNames := list -}}
{{- $coreBaseName := printf "%s-core" .Release.Name -}}
{{- if .Values.core -}}
{{- $coreBaseName := .Values.core.basename | default (printf "%s-core" .Release.Name) -}}
{{- end -}}
{{- range $i, $k := (keys .Values.global.core.versions | sortAlpha) -}}
{{- $serviceName := printf "reverse-proxy-sticky-session-%s-%s" $coreBaseName (get $.Values.global.core.versions $k).name -}}
{{- $cookieNames = mustAppend $cookieNames $serviceName -}}
{{- if eq $k "latest" -}}
{{- $cookieNames = mustAppend $cookieNames $serviceName -}}
{{- end -}}
{{- end -}}
{{- $cookieNames = concat $cookieNames .Values.server.keepCookies -}}
{{- $cookieNames | toJson -}}
{{- end -}}
