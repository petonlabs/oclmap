import React, { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  FormControl,
  Select,
  Divider,
  Collapse,
  TextField,
  Button,
  Tooltip,
  InputAdornment,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import countBy from 'lodash/countBy'
import omit from 'lodash/omit'
import filter from 'lodash/filter'
import find from 'lodash/find'
import isString from 'lodash/isString'

/**
 * MultiAlgoSelector (MUI5)
 *
 * Props:
 * - algos: Array<{
 *     id: string,
 *     name: React.ReactNode,      // can be <Trans .../>
 *     type: string,               // e.g. "ocl-scispacy", "ocl-ciel-bridge"
 *     provider?: string,
 *     order?: number,
 *     disabled?: boolean,         // disable picking this algo
 *     batch_size?: number,
 *     concurrent_requests?: number,
 *   }>
 *
 * - value: Array<{
 *     id: string,
 *     // per-selected config overrides:
 *     batch_size?: number,
 *     concurrent_requests?: number,
 *     // custom-match example:
 *     url?: string,
 *     token?: string,
 *   }>
 *
 * - onChange: (nextValue) => void
 *
 * Optional:
 * - title?: string
 * - subtitle?: string
 * - allowDuplicateTypes?: boolean (default false)
 * - getAlgoIcon?: (algo) => ReactNode
 */
export default function MultiAlgoSelector({
  algos,
  value,
  onChange,
  maxAlgos=5,
  repo
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(() => new Map());
  const [errors, setErrors] = React.useState({})

  const normalizedValue = useMemo(() => {
    let changed = false;
    const next = value.map(v => {
      if (v.__key) return v;
      changed = true;
      return { ...v, __key: Math.random(100).toString() };
    });
    if (changed) onChange(next);
    return next;
  }, [value]);

  const algosById = useMemo(() => {
    const m = new Map();
    (algos || []).forEach((a) => m.set(a.id, a));
    return m;
  }, [algos]);

  const selectedIds = useMemo(() => new Set((value || []).map((v) => v.id)), [value]);

  const selectedTypes = useMemo(() => {
    const set = new Set();
    (value || []).forEach((v) => {
      const a = algosById.get(v.id);
      if (a?.type) set.add(a.type);
    });
    return set;
  }, [value, algosById]);

  const addableOptions = useMemo(() => {
    const sorted = [...(algos || [])].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    return sorted.filter((a) => {
      if (!a.allow_multiple && a.type && selectedTypes.has(a.type)) return false;
      return true;
    });
  }, [algos, selectedIds, selectedTypes]);

  const canAddMore = addableOptions.length > 0 && value.length < maxAlgos;

  const updateSelected = (key, patch) => {
    const next = normalizedValue.map(v => (v.__key === key ? { ...v, ...patch } : v));
    onChange(next);
    if((patch.id || patch.name)) {
      if(filter(value, patch).length > 0)
        setErrors(prev => ({...prev, [key]: {...prev[key], ...patch}}))
      else if (patch.id)
        setErrors(prev => ({...prev, [key]: {...omit(prev[key], 'id')}}))
      else if (patch.name)
        setErrors(prev => ({...prev, [key]: {...omit(prev[key], 'name')}}))
    }
  };

  const removeSelected = (key) => {
    const next = (value || []).filter((v) => v.__key !== key);
    onChange(next);

    setExpanded((prev) => {
      const n = new Map(prev);
      n.delete(key);
      return n;
    });
  };

  const toggleExpanded = (key) => {
    setExpanded((prev) => {
      const n = new Map(prev);
      n.set(key, !(n.get(key) ?? false));
      return n;
    });
  };

  const addAlgo = (algoId) => {
    if (!algoId) return;
    const algo = algosById.get(algoId);
    if (!algo) return;

    const counts = countBy(value, 'type')[algo.type]
    let id = algo.id
    let name = algo.name
    if(!isString(name)) {
      if(name?.props?.i18nKey) {
        name = t(algo.name?.props?.i18nKey).replace('<0>Premium</0>', '')
      } else
        name = algo.id
    }
    if(counts > 0) {
      id = `${id}-1`
      name = `${name}-1`
    }
    const defaults = {
      ...omit(algo, ['getIcon', 'disabled', 'description']),
      id: id,
      name: name,
      batch_size: algo.batch_size ?? 10,
      concurrent_requests: algo.concurrent_requests ?? 1,
      lookup_required: algo.lookup_required,
      __key: Math.random(100).toString()
    };

    onChange([...(value || []), defaults]);
    setExpanded((prev) => {
      const n = new Map(prev);
      n.set(defaults.__key, algo.type === 'custom');
      return n;
    });
  };

  const renderAlgoIcon = (algo) => {
    if (algo?.getIcon) return algo.getIcon({sx: ({fontSize: '1.5rem', color: 'primary.main'})});
    // fallback: a small "tune" icon; swap with your own per-type icons if you want
    return (
      <Box sx={{ display: "grid", placeItems: "center", width: 34, height: 34 }}>
      <TuneRoundedIcon sx={{fontSize: '1.5rem'}} />
      </Box>
    );
  };
  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={1.5}>
        {(value || []).map((sel, i) => {
          const algo = find(algos, {type: sel.type});
          if (!algo) return null;

          const isOpen = expanded.get(sel.__key) ?? false;
          const hasErrors = errors[sel.__key]?.id || errors[sel.__key]?.name

          return (
            <Paper
              key={i}
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 1,
                  alignItems: "center",
                  px: 1.25,
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  {renderAlgoIcon(algo)}

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {sel.name || algo.name}
                    </Typography>

                    <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 0 }}>
                      {sel.id}
                    </Typography>
                  </Box>

                  <Tooltip title={isOpen ? "Hide settings" : "Show settings"}>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpanded(sel.__key)}
                      sx={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 150ms ease",
                      }}
                      color='secondary'
                    >
                      <ExpandMoreRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Tooltip title={t('common.remove')}>
                  <IconButton
                    onClick={() => removeSelected(sel.__key)}
                    color='error'
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Divider />
                <Box sx={{ p: 2 }}>
                  {/* Common config */}
                  <Stack spacing={2}>
                    {/* Custom Match example: show URL/token fields if type matches */}
                    {algo.type === "custom" ? (
                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          p: 2,
                          borderLeftWidth: 4,
                          borderLeftColor: "primary.main",
                          borderLeftStyle: "solid",
                        }}
                      >
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <TextField
                              sx={{width: '50%'}}
                              required
                              label={t('common.id')}
                              value={sel.id || ''}
                              onChange={(e) =>
                                updateSelected(sel.__key, { id: e.target.value || '' })
                              }
                              error={Boolean(errors[sel.__key]?.id)}
                              helperText={errors[sel.__key]?.id ? t('map_project.algo_conflicting_id') : ''}
                            />
                            <TextField
                              sx={{width: '50%'}}
                              required
                              label={t('common.name')}
                              value={sel.name || ''}
                              onChange={(e) =>
                                updateSelected(sel.__key, {
                                  name: e.target.value || '',
                                })
                              }
                              error={Boolean(errors[sel.__key]?.name)}
                              helperText={errors[sel.__key]?.name ? t('map_project.algo_conflicting_name') : ''}
                            />
                          </Stack>
                        <Stack direction={{ xs: "column", sm: "row" }} sx={{marginTop: '12px'}} spacing={1.5}>
                          <TextField
                            fullWidth
                            label={t('common.description')}
                            value={sel.description || ''}
                            onChange={(e) =>
                              updateSelected(sel.__key, { id: e.target.value || '' })
                            }
                          />
                        </Stack>
                        <Stack spacing={1.5} sx={{marginTop: '12px'}}>
                          <TextField
                            fullWidth
                            required
                            label={t('map_project.api_url')}
                            value={sel.url || ""}
                            onChange={(e) => updateSelected(sel.__key, { url: e.target.value })}
                            placeholder="https://example.com/match"
                          />
                          <TextField
                            fullWidth
                            type='password'
                            label={t('map_project.api_token')}
                            value={sel.token || ""}
                            onChange={(e) => updateSelected(sel.__key, { token: e.target.value })}
                            placeholder="••••••••"
                          />

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <TextField
                              label={t('map_project.batch_size')}
                              sx={{width: '50%'}}
                              type="number"
                              value={sel.batch_size ?? algo.batch_size ?? 10}
                              onChange={(e) =>
                                updateSelected(sel.__key, { batch_size: clampInt(e.target.value, 1, 1000) })
                              }
                              InputProps={{
                                endAdornment: <InputAdornment position="end">rows</InputAdornment>,
                              }}
                            />

                            <TextField
                              label={t('map_project.concurrent_requests')}
                              sx={{width: '50%'}}
                              type="number"
                              value={sel.concurrent_requests ?? algo.concurrent_requests ?? 1}
                              onChange={(e) =>
                                updateSelected(sel.__key, {
                                  concurrent_requests: clampInt(e.target.value, 1, 50),
                                })
                              }
                            />
                            <FormControlLabel sx={{'.MuiTypography-root': {fontSize: '14px'}}} control={<Checkbox size='small' checked={sel.lookup_required || false} />} label="Lookup Required" onChange={e => updateSelected(sel.__key, {lookup_required: e.target.checked})} />
                          </Stack>

                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size='small' color='error' variant="outlined" onClick={() => toggleExpanded(sel.__key)} sx={{textTransform: 'none'}}>
                              {t('common.close')}
                            </Button>
                            <Button disabled={hasErrors} size='small' variant="contained" onClick={() => toggleExpanded(sel.__key)} sx={{textTransform: 'none'}}>
                              {t('common.save')}
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    ) : (
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <TextField
                          label={t('common.id')}
                          sx={{width: '50%'}}
                          value={sel.id || ''}
                          onChange={(e) => updateSelected(sel.__key, { id: e.target.value || '' })}
                          error={Boolean(errors[sel.__key]?.id)}
                          helperText={errors[sel.__key]?.id ? t('map_project.algo_conflicting_id') : ''}
                        />
                        <TextField
                          label={t('map_project.batch_size')}
                          sx={{width: '50%'}}
                          type="number"
                          value={sel.batch_size ?? algo.batch_size ?? 10}
                          onChange={(e) => updateSelected(sel.__key, { batch_size: clampInt(e.target.value, 1, 1000) })}
                        />
                        <TextField
                          label={t('map_project.concurrent_requests')}
                          sx={{width: '50%'}}
                          type="number"
                          value={sel.concurrent_requests ?? algo.concurrent_requests ?? 1}
                          onChange={(e) =>
                            updateSelected(sel.__key, {
                              concurrent_requests: clampInt(e.target.value, 1, 50),
                            })
                          }
                        />
                        <FormControlLabel sx={{'.MuiTypography-root': {fontSize: '14px'}}} control={<Checkbox size='small' disabled={algo.provider === 'ocl'} checked={sel.lookup_required || false} />} label={t('map_project.lookup_required')} onChange={e => updateSelected(sel.__key, {lookup_required: e.target.checked})} />
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          );
        })}

        {/* Add algo row */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            p: 1.25,
            borderStyle: "dashed",
            opacity: canAddMore ? 1 : 0.6,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ display: "grid", placeItems: "center", width: 34, height: 34 }}>
              <AddRoundedIcon />
            </Box>

            <FormControl fullWidth size="small" disabled={!canAddMore}>
              <Select
                displayEmpty
                value=""
                renderValue={(v) => (v ? v : t('map_project.select_an_algo'))}
                MenuProps={{PaperProps: {style: {maxWidth: '350px'}}}}
              >
                {
                  addableOptions.map((a, index) => {
                    let isDisabled = a.disabled || (a.type === 'ocl-semantic' && find(value, {type: 'ocl-search'})) || (a.type === 'ocl-search' && find(value, {type: 'ocl-semantic'}))
                    if(a.type === 'ocl-semantic' && !repo?.match_algorithms?.includes('llm') && !isDisabled)
                      isDisabled = true
                  return (
                    <ListItemButton id={a.id} key={index} value={a.id} disabled={isDisabled} onClick={() => addAlgo(a.id)}>
                      <ListItemIcon sx={{minWidth: 'auto', marginRight: '16px'}}>
                        {renderAlgoIcon(a)}
                      </ListItemIcon>
                      <ListItemText primary={a.name} secondary={a.description} />
                    </ListItemButton>
                  )
                  })
                }
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

function clampInt(value, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
